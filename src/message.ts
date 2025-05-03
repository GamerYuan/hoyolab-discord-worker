import { Message, Embed } from './types/discord_embed';
import { InsertCard, InsertVideo, PostData, PostDetail, StructuredInsert, Vote } from './types/hoyolab_post';
import { LOCALISATION_STRINGS, DEFAULT_HEADER_DICT } from './types/localisation';
import { Button, Component, Container, MediaGallery, Section, Separator, TextDisplay } from './types/components_v2';
import SETTINGS from '../config.json';

const POST_DATA = 'https://bbs-api-os.hoyolab.com/community/post/wapi/getPostFull';
const URL_RE = new RegExp(/(https?:\/\/)(.*)\b/, 'g');
const ESC_RE = new RegExp(/((?<=^\d)\.)|(\*)|(^\-)/, 'gm');
const COMPONENT_LIMIT = 5;

async function buildMessage(postID: number, lang: string, postLen: number): Promise<Embed> {
	const postDetail = await fetchPostDetail(postID, lang);
	const currentLang = postDetail.data.post.post.lang;
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
				postDetail.data.post.post.origin_lang != currentLang
					? `HoYoLAB · ${LOCALISATION_STRINGS[currentLang].footer}` // Updated reference
					: 'HoYoLAB',
			icon_url: 'https://media.discordapp.net/attachments/943106145546014732/1137378106135564358/favicon.png',
		},
		timestamp: new Date(postDetail.data.post.post.created_at * 1000),
		title: postDetail.data.post.post.subject,
		description: buildPostDetail(postDetail, postLen),
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

async function buildMessageComponent(postDetail: PostData, lang: string, postLen: number): Promise<Container> {
	const base: Container = new Container();
	const currentLang = postDetail.data.post.post.lang;
	const footer =
		postDetail.data.post.post.origin_lang != currentLang
			? `-# HoYoLAB · ${LOCALISATION_STRINGS[currentLang].footer} · <t:${postDetail.data.post.post.created_at}:F>` // Updated reference
			: `-# HoYoLAB · <t:${postDetail.data.post.post.created_at}:F>`;

	base.components.push(
		new TextDisplay(`## [${postDetail.data.post.post.subject}](https://www.hoyolab.com/article/${postDetail.data.post.post.post_id})`)
	);
	base.components = base.components.concat(
		buildPostDetailComponent(postDetail, postLen - (base.components[0] as TextDisplay).content.length - footer.length)
	);

	if (postDetail.data.post.cover_list.length > 0) {
		base.components.push(new Separator(1, false));
		const media = new MediaGallery();
		media.items.push({
			media: { url: postDetail.data.post.cover_list[0].url },
		});
		base.components.push(media);
	} else if (postDetail.data.post.image_list.length > 0) {
		base.components.push(new Separator(1, false));
		const media = new MediaGallery();
		media.items.push({
			media: { url: postDetail.data.post.image_list[0].url },
		});
		base.components.push(media);
	}

	base.components.push(new TextDisplay(footer));

	return base;
}

function countAllComponents(component: Component): number {
	let count = 1;

	if (component instanceof Container) {
		for (const childComponent of component.components) {
			count += countAllComponents(childComponent);
		}
	}

	if (component instanceof Section) {
		for (const childComponent of component.components) {
			count += countAllComponents(childComponent);
		}
		if (component.accessory) count += 1;
	}

	return count;
}

export async function pushToDiscord(posts: number[], webhooks: string, roles: readonly string[] = [], lang: string = 'en-us') {
	const list = webhooks.split(',');
	// Sends from oldest to newest
	const webhookPayload: Message = {};
	const postLen = Math.max(600, Math.min(1000, SETTINGS.use_components ? 3500 : 6000 / posts.length));
	if (!SETTINGS.use_components) {
		webhookPayload.embeds = await Promise.all(posts.slice(0, 10).map(async (post) => await buildMessage(post, lang, postLen)));
		if (roles && roles.length > 0) {
			webhookPayload.content = roles.map((role) => `@<&${role}>`).join('');
			webhookPayload.allowed_mentions = {
				parse: ['roles'],
			};
		}
	} else {
		let totalComponentCount = 0;
		const containers: Container[] = [];
		const latestPosts = posts.slice(0, 10).map(async (id) => await fetchPostDetail(id, lang));

		for (const post of latestPosts) {
			const container = await buildMessageComponent(await post, lang, postLen);
			const containerComponentCount = countAllComponents(container);
			if (totalComponentCount + containerComponentCount >= 30) {
				break;
			}
			containers.unshift(container);
			totalComponentCount += containerComponentCount;
		}

		webhookPayload.components = containers;
		webhookPayload.flags = 32768;
		webhookPayload.username = (await latestPosts[0]).data.post.user.nickname;
		webhookPayload.avatar_url = (await latestPosts[0]).data.post.user.avatar_url;
		if (roles && roles.length > 0) {
			const roleString = roles.map((role) => `@<&${role}>`).join('');
			webhookPayload.components.map((container) => {
				if (container instanceof Container) {
					(container.components[container.components.length - 1] as TextDisplay).content += ` · ${roleString}`;
				}
			});
		}
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
	const response = await fetch(SETTINGS.use_components ? `${webhook}?with_components=true` : webhook, {
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
	const target = `${POST_DATA}?post_id=${postID}&scene=1`;
	const requestHeader = DEFAULT_HEADER_DICT;
	requestHeader['X-Rpc-Language'] = lang;
	const response = await fetch(target, {
		headers: requestHeader,
		method: 'GET',
	});

	return await response.json<PostData>();
}

export function buildPostDetail(post: PostData, postLen: number): string {
	const content: StructuredInsert[] = JSON.parse(post.data.post.post.structured_content);

	if (!Array.isArray(content) || content.length == 0) {
		return '';
	}

	let final: string = '';
	let currLen: number = post.data.post.post.subject.length;
	const currentLang = post.data.post.post.lang; // Get current language once

	for (let i = 0; i < content.length; i++) {
		let elem = content[i];
		const elemType = getElementType(elem);

		switch (elemType) {
			case ElementType.IMAGE:
				continue;
			case ElementType.EMOJI:
				continue;
			case ElementType.NONE:
				continue;
			case ElementType.ARTICLE:
				continue;
			case ElementType.VIDEO:
				const insertVideo = elem.insert as InsertVideo;
				const url = `\n[[${LOCALISATION_STRINGS[currentLang].video}]](${
					URL_RE.test(insertVideo.video) ? insertVideo.video : `https://www.hoyolab.com/article/${post.data.post.post.post_id}`
				})\n`;
				final += url;
				currLen += url.length;
				break;
			case ElementType.VOTE:
				const vote = elem.insert as Vote;
				const insertVote = `\n[VOTE]: ${vote.vote.title}\n`;
				final += insertVote;
				currLen += insertVote.length;
				break;
			case ElementType.LINK:
				const link = elem.attributes?.link;
				if (!link) break;
				const insertText = elem.insert as string;
				let linkText: string;

				if (link.trim() === insertText.trim()) {
					linkText = insertText;
				} else if (insertText.trim().match(URL_RE)) {
					linkText = link.trim();
				} else {
					linkText = `[${insertText}](${link.trim()})`;
				}

				final += linkText;
				currLen += linkText.length;
				break;
			case ElementType.TEXT:
				const str = elem.insert as string;
				const formattedText = str
					.replace(URL_RE, (url) => `\0${url}\0`)
					.split('\0')
					.map((part) => (URL_RE.test(part) ? part : part.replace(ESC_RE, '\\$&')))
					.join('');
				final += formattedText;
				currLen += formattedText.length;
				break;
			default:
				break;
		}

		if (currLen >= postLen) {
			const detailString = LOCALISATION_STRINGS[currentLang].details; // Updated reference

			if (elemType === ElementType.TEXT) {
				const lastBoundary = final.substring(0, postLen).lastIndexOf(' ');
				final = `${final.substring(0, lastBoundary)}...\n\n${detailString}`;
			} else {
				final += `\n\n${detailString}`;
			}

			break;
		}
	}

	return final.trimStart();
}

export function buildPostDetailComponent(post: PostData, postLen: number): Component[] {
	const components: Component[] = [];
	let content: StructuredInsert[] = [];

	if (!post.data.post.post.structured_content) {
		content.push({ insert: JSON.parse(post.data.post.post.content) });
	} else {
		const structured = JSON.parse(post.data.post.post.structured_content);
		content = content.concat(structured);
	}

	if (!Array.isArray(content) || content.length == 0) {
		return components;
	}
	let currLen = 0;
	const currentLang = post.data.post.post.lang; // Get current language once

	for (let i = 0; i < content.length; i++) {
		let elem = content[i];
		const elemType = getElementType(elem);

		switch (elemType) {
			case ElementType.IMAGE:
				continue;
			case ElementType.EMOJI:
				continue;
			case ElementType.NONE:
				continue;
			case ElementType.ARTICLE:
				const article = elem.insert as InsertCard;
				console.log(article);

				for (let j = 0; j < article.card_group.article_cards.length && j < 3 && components.length < COMPONENT_LIMIT; j++) {
					const articleSection = new Section();
					articleSection.components.push(
						new TextDisplay(`${article.card_group.article_cards[j].info.title}\n-# ${article.card_group.article_cards[j].user.nickname}`)
					);
					articleSection.accessory = new Button(LOCALISATION_STRINGS[currentLang].article_button, 5);
					articleSection.accessory.url = `https://www.hoyolab.com/article/${article.card_group.article_cards[j].meta.meta_id}`;
					currLen += article.card_group.article_cards[j].info.title.length + 3 + article.card_group.article_cards[j].user.nickname.length;
					components.push(articleSection);
				}
				break;
			case ElementType.VIDEO:
				const insertVideo = elem.insert as InsertVideo;
				const videoSection = new Section();
				videoSection.components.push(new TextDisplay(`[${LOCALISATION_STRINGS[currentLang].video}]`)); // Use localisation string
				videoSection.accessory = new Button(LOCALISATION_STRINGS[currentLang].video_button, 5); // Use localisation string
				videoSection.accessory.url = URL_RE.test(insertVideo.video)
					? insertVideo.video
					: `https://www.hoyolab.com/article/${post.data.post.post.post_id}`;
				components.push(videoSection);
				if (components.length >= COMPONENT_LIMIT) {
					break;
				}
				currLen += LOCALISATION_STRINGS[currentLang].video.length + 2; // Adjust length calculation
				break;
			case ElementType.VOTE:
				const voteSection = new Section();
				const vote = elem.insert as Vote;
				voteSection.components.push(new TextDisplay(vote.vote.title));
				voteSection.accessory = new Button(LOCALISATION_STRINGS[currentLang].vote_button, 5); // Use localisation string
				voteSection.accessory.url = `https://www.hoyolab.com/article/${post.data.post.post.post_id}`;
				components.push(voteSection);
				if (components.length >= COMPONENT_LIMIT) {
					break;
				}
				currLen += vote.vote.title.length; // Adjust length calculation
				break;
			case ElementType.LINK:
				const link = elem.attributes?.link;
				if (!link) break;
				const insertText = elem.insert as string;
				let text: TextDisplay;
				if (components.length > 0 && components[components.length - 1] instanceof TextDisplay) {
					text = components[components.length - 1] as TextDisplay;
				} else {
					text = new TextDisplay('');
					components.push(text);
				}

				if (link.trim() === insertText.trim()) {
					text.content += insertText;
					currLen += insertText.length;
				} else if (insertText.trim().match(URL_RE)) {
					text.content += link.trim();
					currLen += link.trim().length;
				} else {
					const str = `[${insertText}](${link.trim()})`;
					text.content += str;
					currLen += str.length;
				}
				break;
			case ElementType.TEXT:
				const str = elem.insert as string;
				const formattedText = str
					.replace(URL_RE, (url) => `\0${url}\0`)
					.split('\0')
					.map((part) => (URL_RE.test(part) ? part : part.replace(ESC_RE, '\\$&')))
					.join('');
				if (components.length > 0 && components[components.length - 1] instanceof TextDisplay) {
					(components[components.length - 1] as TextDisplay).content += formattedText;
				} else {
					components.push(new TextDisplay(formattedText));
				}
				currLen += formattedText.length;
				break;
			default:
				break;
		}

		if (currLen >= postLen) {
			const detailString = LOCALISATION_STRINGS[currentLang].details; // Updated reference

			if (components[components.length - 1] instanceof TextDisplay) {
				const text = components[components.length - 1] as TextDisplay;
				let lastBoundary = postLen - (currLen - text.content.length);
				while (lastBoundary > 0 && text.content.charAt(lastBoundary) !== ' ') {
					lastBoundary--;
				}
				text.content = `${text.content.substring(0, lastBoundary)}...\n\n${detailString}`;
			} else {
				components.push(new TextDisplay(`\n\n${detailString}`));
			}

			break;
		}
	}

	if (
		components[components.length - 1] instanceof TextDisplay &&
		(components[components.length - 1] as TextDisplay).content.trim() === ''
	) {
		components.pop();
	}

	return components;
}

function getElementType(element: StructuredInsert): ElementType {
	const { insert, attributes } = element;

	if (attributes && attributes.link) {
		return ElementType.LINK;
	}

	if (typeof insert === 'string') {
		return ElementType.TEXT;
	}

	if ('image' in insert) {
		return ElementType.IMAGE;
	}
	if ('video' in insert) {
		return ElementType.VIDEO;
	}
	if ('vote' in insert) {
		return ElementType.VOTE;
	}
	if ('card_group' in insert) {
		return ElementType.ARTICLE;
	}
	if ('backup' in insert) {
		return ElementType.EMOJI;
	}

	return ElementType.NONE;
}

enum ElementType {
	TEXT,
	LINK,
	IMAGE,
	VIDEO,
	VOTE,
	EMOJI,
	ARTICLE,
	NONE,
}
