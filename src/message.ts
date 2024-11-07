import { Message, Embed } from './types/discord_embed';
import { PostData } from './types/hoyolab_post';
import { LANG_DETAILS, LANG_ABBR, FOOTER_TEXT, DEFAULT_HEADER_DICT } from './types/constants';

const POST_LENGTH: number = 500;
const POST_DATA = 'https://bbs-api-os.hoyolab.com/community/post/wapi/getPostFull';
const URL_RE = new RegExp('(https?://)(.*)\b');

async function buildMessage(postID: number, lang: string): Promise<Embed> {
	const postDetail = await fetchPostDetail(postID, lang);
	const base: Partial<Embed> = {
		color: 7436279,
		url: `https://www.hoyolab.com/article/${postDetail.data.post.post.post_id}`,
		author: {
			name: postDetail.data.post.user.nickname,
			url: `https://www.hoyolab.com/accountCenter/postList?id=${postDetail.data.post.user.uid}`,
			icon_url: postDetail.data.post.user.avatar_url,
		},
		footer: {
			text:
				postDetail.data.post.post.origin_lang != postDetail.data.post.post.lang
					? `HoYoLAB · ${FOOTER_TEXT[LANG_ABBR.indexOf(postDetail.data.post.post.lang)]}`
					: 'HoYoLAB',
			icon_url: 'https://media.discordapp.net/attachments/943106145546014732/1137378106135564358/favicon.png',
		},
		timestamp: new Date(postDetail.data.post.post.created_at * 1000),
		title: postDetail.data.post.post.subject,
		description: await buildPostDetail(postDetail),
	};

	if (postDetail.data.post.cover_list.length > 0) {
		base.image = {
			url: postDetail.data.post.cover_list[0].url,
		};
	} else if (postDetail.data.post.image_list.length > 0) {
		base.image = {
			url: postDetail.data.post.image_list[0].url,
		};
	}

	return base;
}

export async function pushToDiscord(posts: number[], webhooks: string, roles: readonly string[] = [], lang: string = 'en-us') {
	const list = webhooks.split(',');
	// Sends from oldest to newest
	const embeds = await Promise.all(
		posts
			.slice(0, 10)
			.map(async (post) => await buildMessage(post, lang))
			.reverse()
	);
	const webhookPayload: Message = {
		embeds,
		allowed_mentions: {
			parse: [],
		},
	};
	if (roles && roles.length > 0) {
		webhookPayload.content = roles.map((role) => `@<&${role}>`).join('');
		webhookPayload.allowed_mentions = {
			parse: ['roles'],
		};
	}

	const payloads = [];
	for (let i = 0; i < list.length; i++) {
		payloads.push(pushMessage(webhookPayload, list[i]));
	}
	await Promise.all(payloads);
}

export async function pushMessage(content: Message, webhook: string) {
	const bodyStr = JSON.stringify(content);
	console.log(`Payload: ${bodyStr}`);
	const response = await fetch(webhook, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: '*/*',
		},
		body: bodyStr,
	});
	if (!response.ok) {
		const text = await response.text();
		console.error(`Webhook Failed`, response.status, text);
		throw new Error(`Webhook Failed: ${response.status}, ${text}`);
	}
}

export async function fetchPostDetail(postID: number, lang: string): Promise<PostData> {
	const target = `${POST_DATA}?post_id=${postID}`;
	const requestHeader = DEFAULT_HEADER_DICT;
	requestHeader['X-Rpc-Language'] = lang;
	const response = await fetch(target, {
		headers: requestHeader,
		method: 'GET',
	});

	return await response.json<PostData>();
}

export async function buildPostDetail(post: PostData): Promise<string> {
	if (!post.data.post.post.structured_content) {
		return '';
	}
	const content = JSON.parse(post.data.post.post.structured_content);
	if (!Array.isArray(content)) return '';

	const ret = content.map(processElement);
	let final: string = '';
	let currLen: number = 0;

	for (let i = 0; i < ret.length; i++) {
		let elem = ret[i];
		if (elem[0] === 0) continue;

		let insertText = elem[1];

		final += insertText;
		currLen += insertText.length;

		if (currLen <= POST_LENGTH) continue;

		const detailString = LANG_DETAILS[LANG_ABBR.findIndex((x) => x === post.data.post.post.lang)];
		switch (elem[0]) {
			case 1:
				final = `${final.substring(0, POST_LENGTH)}...\n\n${detailString}`;
				break;
			case 2:
				final += `\n\n${detailString}`;
				break;
		}
		break;
	}

	return final.trimStart();
}

function processElement(element: any): [number, string] {
	const insertVal = element.hasOwnProperty('insert') ? element['insert'] : '';

	if (typeof insertVal !== 'string') {
		return [0, ''];
	}

	if (element.hasOwnProperty('attributes') && element['attributes'].hasOwnProperty('link')) {
		const link = element['attributes']['link'];
		if (link.trim() === insertVal.trim()) {
			return [2, insertVal];
		} else if (insertVal.trim().match(URL_RE)) {
			return [2, link.trim()];
		} else {
			return [2, `[${insertVal}](${link.trim()})`];
		}
	} else if (insertVal.trim().match(URL_RE)) {
		return [2, insertVal.trim()];
	} else {
		return [1, insertVal.replace(/[.*-]/g, (match) => `\\${match}`)];
	}
}
