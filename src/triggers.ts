import { Env } from './worker';
import { HoyolabList, PostSummary } from './types/hoyolab_api';
import { SETTINGS } from './user-config';
import { pushToDiscord } from './message';

let env: Env;
const API = 'https://bbs-api-os.hoyolab.com/community/post/wapi/userPost'

export async function fetchMessageList(userID: string): Promise<PostSummary[]> {
    const target = `${API}?size=10&uid=${userID}`;

    const response = await fetch(target, {
        headers: {
            Accept: 'application/json',
            'User-Agent': 'Mozilla/5.0',
        },
        method: 'GET',
    })

    const json = await response.json<HoyolabList>();
    let list = json.data.list;

    if (list.length > 0 && (list[0].tags.is_user_top && Number(list[0].post.post_id) < Number(list[1].post.post_id))) {
        list = list.slice(1);
    }

    return list;
}

// Get new posts posted since last trigger
export function filterPost(list: PostSummary[], last: number): PostSummary[] {
    const filtered = list.filter(post => Number(post.post.post_id) > last);
    return filtered;
}

async function processSingleUser(userID: string, webhooks: readonly string[], roles:{ readonly [k in typeof webhooks[number]]: readonly string[]}, force = false) {
    const KV_KEY = `feed_${userID}`;
    const updateKV = async (list: PostSummary[]) => {
        await env.POST_CACHE.put(KV_KEY, list[0].post.post_id);
    }

    let list = await fetchMessageList(userID);
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
        await pushToDiscord(newPosts, webhook, roles[key] ?? []);
    }
    console.log(`Sent ${newPosts.length} posts.`)
    await updateKV(list);
}

export async function onScheduled(_env: Env) {
    env = _env;
    const subs = SETTINGS.subscriptions;
    for (const [uid, options] of Object.entries(subs)) {
        await processSingleUser(uid, options.webhookKeys, options.roles);
    }
}