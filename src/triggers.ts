import { Env } from './worker';
import { HoyolabList } from './types/hoyolab_api';
import SETTINGS from '../config.json';
import { pushToDiscord } from './message';
import { LANG_ABBR, DEFAULT_HEADER_DICT } from './types/localisation';
import { Post } from './types/hoyolab_post';
import { fetchWebhook } from './db_service';

let env: Env;
const API = 'https://bbs-api-os.hoyolab.com/community/post/wapi/userPost';

export async function fetchMessageList(userID: string, lang: string = 'en-us'): Promise<Post[]> {
	const target = `${API}?size=10&uid=${userID}`;

	const requestHeader = DEFAULT_HEADER_DICT;
	requestHeader['X-Rpc-Language'] = lang;
	const response = await fetch(target, {
		headers: requestHeader,
		method: 'GET',
	});

	const json = await response.json<HoyolabList>();
	let list = json.data.list;

	if (list.length > 0 && list[0].tags.is_user_top && Number(list[0].post.post_id) < Number(list[1].post.post_id)) {
		list = list.slice(1);
	}

	return list;
}

// Get new posts posted since last trigger
export function filterPost(list: number[], last: number): number[] {
	const filtered = list.filter((x) => x > last);
	return filtered;
}

// Define a type for the webhook configuration within the new structure
interface WebhookConfig {
	key: string;
	roles: readonly string[];
	language: string;
}

async function processSingleUser(userID: number, webhooksConfig: readonly WebhookConfig[], force = false) {
	console.log(`Processing user: ${userID}`);
	const KV_KEY = `feed_${userID}`;
	const updateKV = async (list: number[]) => {
		await env.POST_CACHE.put(KV_KEY, list[0].toString());
	};

	let fetchMessage = fetchMessageList(String(userID)).then((m) => m.flatMap((x) => Number(x.post.post_id)));
	const postCache = env.POST_CACHE.get<number>(KV_KEY);

	const [list, last] = await Promise.all([fetchMessage, postCache]);

	if (list.length == 0) {
		return;
	}

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
		newPosts = [list[0]];
	}
	console.log(`Found ${newPosts.length} new posts for UID ${userID}.`);

	const pushJobs = [];

	// Iterate through the webhook configurations for this user
	for (let config of webhooksConfig) {
		const webhook = await fetchWebhook(env, config.key);
		if (!webhook) {
			console.error(`No Webhook URL for key: ${config.key}, UID: ${userID} skipped`);
			continue;
		}
		pushJobs.push(
			pushToDiscord(
				newPosts,
				webhook,
				config.roles ?? [],
				config.language == '' || !LANG_ABBR.includes(config.language.trim()) ? 'en-us' : config.language
			)
		);
	}
	await Promise.all(pushJobs);
	console.log(`Sent ${newPosts.length} posts for UID ${userID}.`);
	if (!force) {
		await updateKV(list);
	}
}

export async function onScheduled(_env: Env) {
	env = _env;
	const subs = SETTINGS.subscriptions;
	const jobs = [];
	for (const subscription of subs) {
		jobs.push(processSingleUser(subscription.uid, subscription.webhooks));
	}
	await Promise.allSettled(jobs);
}
