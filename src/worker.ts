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
import { fetchPostDetail, buildPostDetail, pushMessage, pushToDiscord, buildPostDetailComponent } from './message';
import { Post } from './types/hoyolab_post';
import { LANG_ABBR } from './types/localisation';

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
		const { TOKEN } = env;
		if (!TOKEN) return new Response('No Token. Functions disabled.');
		const router = Router({ base: `/${TOKEN}` });

		router
			.get('/test_fetch/:id', async ({ params, query }) => {
				const lang = (query?.lang as string) == undefined ? 'en-us' : (query?.lang as string);
				if (!LANG_ABBR.includes(lang)) return new Response('Language not supported');
				return Response.json(await fetchMessageList(params.id, lang));
			})
			.get('/test_kv/:id', async ({ params }) => {
				const list = await env.POST_CACHE.get<Post[]>(`feed_${params.id}`, 'json');
				return Response.json(list);
			})
			.get('/test_discord/:id', async ({ params, query }) => {
				const lang = (query?.lang as string) == undefined ? 'en-us' : (query?.lang as string);
				if (!LANG_ABBR.includes(lang)) return new Response('Language not supported');
				const list = (await fetchMessageList(params!.id, lang)).flatMap((x) => Number(x.post.post_id));
				const webhook_kv = query?.webhook as string;
				if (!webhook_kv) return new Response('Webhook query not found!');
				const webhook = await env.WEBHOOKS.get(webhook_kv);
				if (!webhook) return new Response(`Webhook: ${webhook_kv} Not Found!`);
				await pushToDiscord(list, webhook, [], lang);
				return new Response('OK');
			})
			.get('/test_webhook', async ({ query }) => {
				const webhook_kv = query?.webhook as string;
				if (!webhook_kv) return new Response('Webhook query not found!');
				const webhook = await env.WEBHOOKS.get(webhook_kv);
				if (!webhook) return new Response(`Webhook: ${webhook_kv} Not Found!`);
				const content = {
					content: `${webhook_kv} Test`,
				};
				await pushMessage(content, webhook);
				return new Response('OK');
			})
			.get('/test_post/:id', async ({ params, query }) => {
				const lang = (query?.lang as string) == undefined ? 'en-us' : (query?.lang as string);
				if (!LANG_ABBR.includes(lang)) return new Response('Language not supported');
				const data = await fetchPostDetail(Number(params!.id), lang);
				return Response.json(data);
			})
			.get('/test_message/:id', async ({ params, query }) => {
				const lang = (query?.lang as string) == undefined ? 'en-us' : (query?.lang as string);
				if (!LANG_ABBR.includes(lang)) return new Response('Language not supported');
				const data = await fetchPostDetail(Number(params!.id), lang);
				const message = buildPostDetail(data, 1000);
				return new Response(message);
			})
			.get('/test_message_component/:id', async ({ params, query }) => {
				const lang = (query?.lang as string) == undefined ? 'en-us' : (query?.lang as string);
				if (!LANG_ABBR.includes(lang)) return new Response('Language not supported');
				const data = await fetchPostDetail(Number(params!.id), lang);
				const message = buildPostDetailComponent(data, 1000);
				return Response.json(message);
			});
		return router.handle(request).catch(() => new Response('Error'));
	},
};
