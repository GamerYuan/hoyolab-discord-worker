import { Message, Embed } from './types/discord_embed'
import { PostData } from './types/hoyolab_post'
import { LANG_DETAILS, LANG_ABBR, FOOTER_TEXT, DEFAULT_HEADER_DICT } from './types/constants';

const POST_LENGTH: number = 500;
const POST_DATA = 'https://bbs-api-os.hoyolab.com/community/post/wapi/getPostFull';
const URL_RE = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+");

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
            text: postDetail.data.post.post.origin_lang != postDetail.data.post.post.lang ? `HoYoLAB · ${FOOTER_TEXT[LANG_ABBR.indexOf(postDetail.data.post.post.lang)]}` : 'HoYoLAB',
            icon_url: 'https://media.discordapp.net/attachments/943106145546014732/1137378106135564358/favicon.png',
        },
        timestamp: new Date(postDetail.data.post.post.created_at * 1000),
        title: postDetail.data.post.post.subject,
        description: await buildPostDetail(postDetail),
    }

    if (postDetail.data.post.cover_list.length > 0) {
        base.image = {
            url: postDetail.data.post.cover_list[0].url,
        }
    } else if (postDetail.data.post.image_list.length > 0) {
        base.image = {
            url: postDetail.data.post.image_list[0].url,
        }
    }

    return base;
}

export async function pushToDiscord(posts: number[], webhooks: string, roles: readonly string[] = [], lang: string = 'en-us') {
    const list = webhooks.split(',');
    // Sends from oldest to newest
    const embeds = await Promise.all(posts.slice(0, 10).map(async post => await buildMessage(post, lang)).reverse());
    const webhookPayload: Message = {
        embeds,
        allowed_mentions: {
            parse: []
        }
    }
    if (roles && roles.length > 0) {
        webhookPayload.content = roles.map(role => `@<&${role}>`).join('');
        webhookPayload.allowed_mentions = {
            parse: ['roles'],
        }
    }
    for (let i = 0; i < list.length; i++) {
        await pushMessage(webhookPayload, list[i]);
    }
}

export async function pushMessage(content: any, webhook: string) {
    const response = await fetch(webhook, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(content),
    })
    if (!response.ok) {
        console.error(`Webhook Failed`, response.status, await response.json())
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
        return "";
    }
    const content = JSON.parse(post.data.post.post.structured_content);
    if (Array.isArray(content)) {
        const ret = content.map(processElement);
        const retLen = ret.length;
        let final: string = "";
        let currLen: number = 0;
        for (let i = 0; i < retLen; i++) {
            let insertText = ret[i]
            if (currLen + insertText.length > POST_LENGTH) {
                const detailString = LANG_DETAILS[LANG_ABBR.findIndex(x => x === post.data.post.post.lang)];
                if (insertText.match(URL_RE)) {
                    final += `${insertText.trim()}\n\n${detailString}`;
                    break;
                }
                final += insertText;
                final = `${final.substring(0, POST_LENGTH)}...\n\n${detailString}`;
                break;
            }
            // Removes Discord markdown
            if (!insertText.match(URL_RE)) {
                insertText = insertText.replace(/[.*-]/g, (match) => `\\${match}`);
            }
            final += insertText;
            currLen += insertText.length;
        }
        return final.trimStart();

    }
    return "";
}

function processElement(element: any): string {
    const insertVal = element.hasOwnProperty('insert') ? element['insert'] : '';

    if (typeof insertVal !== 'string') {
        return '';
    }

    if (element.hasOwnProperty('attributes') && element['attributes'].hasOwnProperty('link')) {
        const link = element['attributes']['link'];

        if (link.includes("?")) {
            const linkSplit = link.substring(0, link.indexOf("?"));
            return `[${insertVal}](${linkSplit.trim()})`;
        } else {
            if (link.trim() === insertVal.trim()) {
                return insertVal;
            } else {
                return `[${insertVal}](${link.trim()})`;
            }
        }
    } else {
        return insertVal;
    }
}