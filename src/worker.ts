/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Router } from 'itty-router';
import { fetchMessageList, onScheduled } from './triggers';
import { getPostDetail, pushMessage, pushToDiscord } from './message';
import { PostSummary } from './types/hoyolab_api';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
	//
	// Example binding to a D1 Database. Learn more at https://developers.cloudflare.com/workers/platform/bindings/#d1-database-bindings
	// DB: D1Database
	POST_CACHE: KVNamespace;
	WEBHOOKS: KVNamespace;
	TOKEN: string;
}

export default {
	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		ctx.waitUntil(onScheduled(env));
	},

	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const { TOKEN } = env
		if (!TOKEN) return new Response('No Token. Functions disabled.');
		const router = Router({ base: `/${TOKEN}` });

		router
			.get('/test_fetch/:id', async({params}) => Response.json(await fetchMessageList(params.id)))
			.get('/test_kv/:id', async({params}) => {
				const list = await env.POST_CACHE.get<PostSummary[]>(`feed_${params.id}`, 'json');
				return Response.json(list);
			})
			.get('/test_discord/:id', async({params, query}) => {
				const list = await fetchMessageList(params!.id);
				const webhook_kv = query?.webhook as string;
				if (!webhook_kv) return new Response('Webhook query not found!')
				const webhook = await env.WEBHOOKS.get(webhook_kv);
				if (!webhook) return new Response(`Webhook: ${webhook_kv} Not Found!`);
				await pushToDiscord(list, webhook, [])
				return new Response('OK');
			})
			.get('/test_webhook', async({query}) => {
				const webhook_kv = query?.webhook as string;
				if (!webhook_kv) return new Response('Webhook query not found!');
				const webhook = await env.WEBHOOKS.get(webhook_kv);
				if (!webhook) return new Response(`Webhook: ${webhook_kv} Not Found!`);
				const content = {
					content: `${webhook_kv} Test`,
				}
				await pushMessage(content, webhook);
				return new Response('OK');
			})
			.get('/test_post/:id', async({params}) => {
				const data = await getPostDetail(Number(params!.id));
				if (data == "") {
					return new Response("No Data");
				}
				return new Response(data);
			})
		return router.handle(request).catch(() => new Response("Error"));
	}
};
