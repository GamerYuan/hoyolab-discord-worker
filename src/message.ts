import { Message, Embed } from './types/discord_embed'
import { PostSummary } from './types/hoyolab_api'
import { PostData } from './types/hoyolab_post'

const POST_LENGTH: number = 500;
const POST_DATA = 'https://bbs-api-os.hoyolab.com/community/post/wapi/getPostFull';

async function buildMessage(post: PostSummary): Promise<Embed> {
    const base: Partial<Embed> = {
        color: 7436279,
        url: `https://www.hoyolab.com/article/${post.post.post_id}`,
        author: {
            name: post.user.nickname,
            url: `https://www.hoyolab.com/accountCenter/postList?id=${post.user.uid}`,
            icon_url: post.user.avatar_url,
        },
        footer: {
            text: 'HoYoLAB',
            icon_url: 'https://media.discordapp.net/attachments/943106145546014732/1137378106135564358/favicon.png',
        },
        timestamp: new Date(post.post.created_at * 1000),
        title: post.post.subject,
        description: await getPostDetail(Number(post.post.post_id)),
    }

    if (post.cover_list.length > 0) {
        base.image = {
            url: post.cover_list[0].url,
        }
    } else if (post.image_list.length > 0) {
        base.image = {
            url: post.image_list[0].url,
        }
    }

    return base;
}

export async function pushToDiscord(posts: PostSummary[], webhooks: string, roles: readonly string[] = []) {
    const list = webhooks.split(',');
    // Sends from oldest to newest
    const embeds = await Promise.all(posts.slice(0, 10).map(async post => await buildMessage(post)).reverse());
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

export async function getPostDetail(postID: number): Promise<string> {
    const target = `${POST_DATA}?post_id=${postID}`;
    const response = await fetch(target, {
        headers: {
            Accept: 'application/json',
            'User-Agent': 'Mozilla/5.0',
        },
        method: 'GET',
    });

    const json = await response.json<PostData>();
    if (!json.data.post.post.structured_content) {
        return "";
    }
    const content = JSON.parse(json.data.post.post.structured_content);
    if (Array.isArray(content)) {
        const ret = content.map(processElement);
        const retLen = ret.length;
        let final: string = "";
        let currLen: number = 0;
        for (let i = 0; i < retLen; i++) {
            if (currLen + ret[i].length > POST_LENGTH) {
                var urlRE= new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?([^ ])+");
                if (ret[i].match(urlRE)) {
                    final += `${ret[i].trim()}\n\nRead more details in the post!`;
                    break;
                }
                final += ret[i];
                final = `${final.substring(0, POST_LENGTH)}...\n\nRead more details in the post!`;
                break;
            }
            final += ret[i];
            currLen += ret[i].length;
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