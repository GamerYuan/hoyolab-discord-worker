import { Message } from './types/webhook';
import { InsertCard, InsertVideo, PostData, StructuredInsert, Vote } from './types/hoyolab_post';
import { LOCALISATION_STRINGS, DEFAULT_HEADER_DICT } from './types/localisation';
import { Button, Component, Container, MediaGallery, Section, Separator, TextDisplay } from './types/components_v2';

const POST_DATA = 'https://bbs-api-os.hoyolab.com/community/post/wapi/getPostFull';
const URL_RE = new RegExp(/(https?:\/\/)(.*)\b/, 'g');
const ESC_RE = new RegExp(/(\*)|(^\-)/, 'gm');
const COMPONENT_LIMIT = 5;

/** Prefixes the last line of the given TextDisplay with an ordered list marker. */
function prefixClosestLineWithOrderedList(text: TextDisplay, index: number): { text: string; addedLength: number } {
	const prefix = `${index}. `;
	if (text.content.length === 0) {
		text.content = prefix;
		return { text: text.content, addedLength: prefix.length };
	}
	const lastNewline = text.content.lastIndexOf('\n');
	const insertPos = lastNewline === -1 ? 0 : lastNewline + 1;
	text.content = text.content.slice(0, insertPos) + prefix + text.content.slice(insertPos);
	return { text: text.content, addedLength: prefix.length };
}

/** Prefixes the last line of the given TextDisplay with an unordered list marker. */
function prefixClosestLineWithUnorderedList(text: TextDisplay): { text: string; addedLength: number } {
	const prefix = '- ';
	if (text.content.length === 0) {
		text.content = prefix;
		return { text: text.content, addedLength: prefix.length };
	}
	const lastNewline = text.content.lastIndexOf('\n');
	const insertPos = lastNewline === -1 ? 0 : lastNewline + 1;
	text.content = text.content.slice(0, insertPos) + prefix + text.content.slice(insertPos);
	return { text: text.content, addedLength: prefix.length };
}

/** Prefixes the last line of the given TextDisplay with a heading 3 marker. */
function prefixClosestLineWithHeading3(text: TextDisplay): { text: string; addedLength: number } {
	const prefix = '### ';
	if (text.content.length === 0) {
		text.content = prefix;
		return { text: text.content, addedLength: prefix.length };
	}
	const lastNewline = text.content.lastIndexOf('\n');
	const insertPos = lastNewline === -1 ? 0 : lastNewline + 1;
	text.content = text.content.slice(0, insertPos) + prefix + text.content.slice(insertPos);
	return { text: text.content, addedLength: prefix.length };
}

export async function buildMessageComponent(postDetail: PostData, postLen: number): Promise<Container> {
	const base: Container = new Container();
	const currentLang = postDetail.data.post.post.lang;
	const footer =
		postDetail.data.post.post.origin_lang != currentLang
			? `-# HoYoLAB · ${LOCALISATION_STRINGS[currentLang].footer} · <t:${postDetail.data.post.post.created_at}:F>` // Updated reference
			: `-# HoYoLAB · <t:${postDetail.data.post.post.created_at}:F>`;

	base.components.push(
		new TextDisplay(`## [${postDetail.data.post.post.subject}](https://www.hoyolab.com/article/${postDetail.data.post.post.post_id})`),
	);
	base.components = base.components.concat(
		buildPostDetailComponent(postDetail, postLen - (base.components[0] as TextDisplay).content.length - footer.length),
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
	const postLen = Math.max(600, Math.min(1000, 3500));

	let totalComponentCount = 0;
	const containers: Container[] = [];
	const latestPosts = posts.slice(0, 10).map(async (id) => await fetchPostDetail(id, lang));

	for (const post of latestPosts) {
		const container = await buildMessageComponent(await post, postLen);
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
		const roleString = roles.map((role) => `<@&${role}>`).join('');
		webhookPayload.components.map((container) => {
			if (container instanceof Container) {
				(container.components[container.components.length - 1] as TextDisplay).content += ` · ${roleString}`;
			}
		});
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
	const response = await fetch(`${webhook}?with_components=true`, {
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

function buildPostDetailComponent(post: PostData, postLen: number): Component[] {
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
	const currentLang = post.data.post.post.lang;
	let orderedListIndex = 1;
	let previousListType: 'ordered' | 'bullet' | null = null;

	for (const elem of content) {
		const insertText = typeof elem.insert === 'string' ? elem.insert : '';

		// Ordered list item
		if (elem.attributes?.list === 'ordered' && insertText === '\n') {
			if (previousListType !== 'ordered') {
				orderedListIndex = 1;
			}
			const text =
				components.length > 0 && components[components.length - 1] instanceof TextDisplay
					? (components[components.length - 1] as TextDisplay)
					: (() => {
							const t = new TextDisplay('');
							components.push(t);
							return t;
						})();
			const prefixed = prefixClosestLineWithOrderedList(text, orderedListIndex);
			orderedListIndex += 1;
			currLen += prefixed.addedLength;
			text.content += insertText;
			currLen += insertText.length;
			previousListType = 'ordered';
			continue;
		}

		// Bullet list item
		if (elem.attributes?.list === 'bullet' && insertText === '\n') {
			const text =
				components.length > 0 && components[components.length - 1] instanceof TextDisplay
					? (components[components.length - 1] as TextDisplay)
					: (() => {
							const t = new TextDisplay('');
							components.push(t);
							return t;
						})();
			const prefixed = prefixClosestLineWithUnorderedList(text);
			currLen += prefixed.addedLength;
			text.content += insertText;
			currLen += insertText.length;
			previousListType = 'bullet';
			continue;
		}

		// Header element
		if ('header' in (elem.attributes ?? {}) && insertText === '\n') {
			const text =
				components.length > 0 && components[components.length - 1] instanceof TextDisplay
					? (components[components.length - 1] as TextDisplay)
					: (() => {
							const t = new TextDisplay('');
							components.push(t);
							return t;
						})();
			const prefixed = prefixClosestLineWithHeading3(text);
			currLen += prefixed.addedLength;
			text.content += insertText;
			currLen += insertText.length;
			previousListType = null;
			continue;
		}

		if (typeof elem.insert === 'object' && ('image' in elem.insert || ('backup' in elem.insert && 'emoticon' in elem.insert))) {
			continue;
		} else if (typeof elem.insert === 'object' && 'card_group' in elem.insert) {
			const article = elem.insert as InsertCard;
			console.log(article);

			for (let j = 0; j < article.card_group.article_cards.length && j < 3 && components.length < COMPONENT_LIMIT; j++) {
				const articleSection = new Section();
				articleSection.components.push(
					new TextDisplay(`${article.card_group.article_cards[j].info.title}\n-# ${article.card_group.article_cards[j].user.nickname}`),
				);
				articleSection.accessory = new Button(LOCALISATION_STRINGS[currentLang].article_button, 5);
				articleSection.accessory.url = `https://www.hoyolab.com/article/${article.card_group.article_cards[j].meta.meta_id}`;
				currLen += article.card_group.article_cards[j].info.title.length + 3 + article.card_group.article_cards[j].user.nickname.length;
				components.push(articleSection);
			}
		} else if (typeof elem.insert === 'object' && 'video' in elem.insert) {
			const insertVideo = elem.insert as InsertVideo;
			const videoSection = new Section();
			videoSection.components.push(new TextDisplay(`[${LOCALISATION_STRINGS[currentLang].video}]`));
			videoSection.accessory = new Button(LOCALISATION_STRINGS[currentLang].video_button, 5);
			videoSection.accessory.url = URL_RE.test(insertVideo.video)
				? insertVideo.video
				: `https://www.hoyolab.com/article/${post.data.post.post.post_id}`;
			components.push(videoSection);
			if (components.length >= COMPONENT_LIMIT) {
				break;
			}
			currLen += LOCALISATION_STRINGS[currentLang].video.length + 2;
		} else if (typeof elem.insert === 'object' && 'vote' in elem.insert) {
			const voteSection = new Section();
			const vote = elem.insert as Vote;
			voteSection.components.push(new TextDisplay(vote.vote.title));
			voteSection.accessory = new Button(LOCALISATION_STRINGS[currentLang].vote_button, 5);
			voteSection.accessory.url = `https://www.hoyolab.com/article/${post.data.post.post.post_id}`;
			components.push(voteSection);
			if (components.length >= COMPONENT_LIMIT) {
				break;
			}
			currLen += vote.vote.title.length;
		} else if (typeof elem.insert === 'string' && elem.attributes?.link) {
			const link = elem.attributes.link;
			const insertText = elem.insert;
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
		} else if (typeof elem.insert === 'string') {
			const str = elem.insert;
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
		}

		if (currLen >= postLen) {
			const detailString = LOCALISATION_STRINGS[currentLang].details;

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
