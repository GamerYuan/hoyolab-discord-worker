import { Env } from './worker';
import { HoyolabList, PostSummary } from './types/hoyolab_api';
import { SETTINGS } from './user-config';
import { pushToDiscord, sendErrorMessage } from './message';
import { LANG_ABBR, DEFAULT_HEADER_DICT } from './types/constants';

let env: Env;
const API = 'https://bbs-api-os.hoyolab.com/community/post/wapi/userPost'

export async function fetchMessageList(userID: string, lang: string = 'en-us'): Promise<PostSummary[]> {
    const target = `${API}?size=10&uid=${userID}`;

    const requestHeader = DEFAULT_HEADER_DICT;
    requestHeader['X-Rpc-Language'] = lang;
    const response = await fetch(target, {
        headers: requestHeader,
        method: 'GET',
    });

    const json = await response.json<HoyolabList>();
    let list = json.data.list;

    if (list.length > 0 && (list[0].tags.is_user_top && Number(list[0].post.post_id) < Number(list[1].post.post_id))) {
        list = list.slice(1);
    }

    return list;
}

// Get new posts posted since last trigger
export function filterPost(list: number[], last: number): number[] {
    const filtered = list.filter(x => x > last);
    return filtered;
}

async function processSingleUser(userID: string, webhooks: readonly string[], roles:{ readonly [k in typeof webhooks[number]]: readonly string[]}, language:{ readonly [k in typeof webhooks[number]]: string}, force = false) {
    const KV_KEY = `feed_${userID}`;
    const updateKV = async (list: number[]) => {
        await env.POST_CACHE.put(KV_KEY, list[0].toString());
    }

    let list = (await fetchMessageList(userID)).flatMap(x => Number(x.post.post_id)); 
    if (list.length == 0) {
        return;
    }
    const last = await env.POST_CACHE.get<number>(KV_KEY);

    // First fetch from user
    if (!last) {
        await updateKV(list);
        return;
    }

    let newPosts = filterPost(list, last);
    if (newPosts.length < 1) {
        if (!force) {
            return;
        }
    }
    for (let key of webhooks) {
        const webhook = await env.WEBHOOKS.get(key)
        if (!webhook) {
            console.log(`No Webhook URL for key: ${key}, UID: ${userID} skipped`);
            continue;
        }
        console.log(language[key]);
        await pushToDiscord(newPosts, webhook, roles[key] ?? [], language[key] == '' || !LANG_ABBR.includes(language[key].trim()) ? 'en-us' : language[key]);
    }
    console.log(`Sent ${newPosts.length} posts.`)
    await updateKV(list);
}

async function processError(message: string, webhooks: readonly string[]) {
    const KEY = "last_error_time"
    const now = Date.now();
    const last = await env.POST_CACHE.get(KEY);
    if (!last) {
        await env.POST_CACHE.put(KEY, now.toString())
        for (let key of webhooks) {
            const webhook = await env.WEBHOOKS.get(key)
            if (!webhook) {
                console.log(`No Webhook URL for key: ${key}, send error message skipped`);
                continue;
            }
            await sendErrorMessage(message, key)
        }
        return
      }
    
      if (now - parseInt(last) > 3600000) {
        for (let key of webhooks) {
            const webhook = await env.WEBHOOKS.get(key)
            if (!webhook) {
                console.log(`No Webhook URL for key: ${key}, send error message skipped`);
                continue;
            }
            await sendErrorMessage(message, key)
        }
        await env.POST_CACHE.put(KEY, Date.now().toString())
      }
}

export async function onScheduled(_env: Env) {
    env = _env;
    const subs = SETTINGS.subscriptions;
    for (const [uid, options] of Object.entries(subs)) {
        try {
            await processSingleUser(uid, options.webhookKeys, options.roles, options.language);
        } catch (e) {
            await processError((e as Error).message, options.webhookKeys)
        }
    }
}