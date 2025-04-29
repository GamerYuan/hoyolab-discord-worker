import { Env } from './worker';

const dict: Map<string, string> = new Map<string, string>();

export async function fetchWebhook(env: Env, key: string): Promise<string> {
	if (dict.has(key)) return dict.get(key)!;

	const webhook = await env.WEBHOOKS.get(key);
	if (!webhook) return '';

	dict.set(key, webhook);
	return webhook;
}
