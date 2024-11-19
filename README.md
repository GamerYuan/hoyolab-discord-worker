# hoyolab-discord-worker

_This repository has been adapted and modified from [worker-bilibili-discord](https://github.com/UnluckyNinja/worker-bilibili-discord) by UnluckyNinja_

With this repository, you can receive post notifications from HoYoLAB as webhook messages in Discord.

Cloudflare Workers is a freemium network service by Cloudflare. You can host your services for free on Cloudflare Workers with some quota limitations. [Learn more](https://workers.cloudflare.com/)

## Features

- Automatically receives webhook messages when the accounts you follow post on HoYoLAB (up to 1min delay due to CRON limitations)
- Well-formatted webhook messages
- Configure primary language of webhook messages (translation made with HoYoLAB's API, official posts will be displayed in its respective language)

## Requirements

- [Node.js 20.x](https://nodejs.org/en)
- [Cloudflare Account](https://www.cloudflare.com/en-gb/)

## Setup

Install Node.js 20.x to your local machine and register a Cloudflare Account.

Clone this repository to your local machine:

```
git clone https://github.com/GamerYuan/hoyolab-discord-worker.git
```

_OR_

Download and extract the repository

Setup the repository by running the following command in the `hoyolab-discord-worker` folder:

```
npm i
```

## Deploying

Open a Terminal in the local repository folder. Then login to Cloudflare:

```
npx wrangler login
```

Deploy the worker before continuing your setup

```
npx wrangler deploy
```

Then open [Cloudflare Workers Dashboard](https://dash.cloudflare.com/) on your browser

Head over to Workers & Pages > KV, and create 2 new namespaces: `hyl-post-cache` and `hyl-webhook`. _You can choose a different name_

Then copy their IDs and open wrangler.toml in the local repository folder.

```toml
name = "hoyolab-discord-worker"
main = "src/worker.ts"
compatibility_date = "2023-05-15"

[[kv_namespaces]]
binding = "POST_CACHE" # <-- DO NOT CHANGE
id = "4797a5b5ec8c4363837b6b34e14a7f01" # <-- change this to the ID of hyl-post-cache

[[kv_namespaces]]
binding = "WEBHOOKS" # <-- DO NOT CHANGE
id = "b744a7f186f1413f9f88e882263bcdae" # <-- change this to the ID of hyl-webhook

[triggers]
crons = ["* * * * *"] # * * * * * = run every minute
```

Change the ID of `POST_CACHE` and `WEBHOOKS` kv_namespaces to the `Namespace ID` newly created KV Namespaces respectively

You can also change the `crons` (timed trigger) if you do not wish to update the feed every minute. See this [article](https://developers.cloudflare.com/workers/configuration/cron-triggers/) for CRON syntax.

> [!TIP]
> [CRON Expression Generator Tool](https://crontab.guru/).

Then open `src/user-config.ts` and configure the accounts to follow and webhooks to use.

```typescript
export const SETTINGS = {
	subscriptions: {
		UID1: {
			webhookKeys: ['WEBHOOK_A', 'WEBHOOK_B'],
			roles: {
				WEBHOOK_A: ['RoleID1'],
				WEBHOOK_B: [], //no ping
			},
			language: {
				WEBHOOK_A: 'en-us',
				WEBHOOK_B: 'zh-cn',
			},
		},
		UID2: {
			webhookKeys: ['WEBHOOK_A'],
			roles: {
				WEBHOOK_A: [],
			},
			language: {
				WEBHOOK_A: 'ja-jp',
			},
		},
	},
} as const;
```

To follow an account, change their UID field with the account ID. This can be found in the URL bar in the user's account page:

![image](https://github.com/GamerYuan/hoyolab-discord-worker/blob/main/assets/HYVID.png)

Then, configure the `webhookKeys`. You should use an alias which represents which Webhook(s) you want the notification to be sent to.

> [!TIP]
> You can use any name as the alias as long as it does not contain any spaces and symbols

Then, configure the roles. You can put a Role ID in your Discord server for each webhook, the roles specified will be pinged as the notification is sent. [Learn more](https://www.itgeared.com/how-to-get-role-id-on-discord). You can add multiple roles and separate them by `,`. No roles will be pinged if the field is left empty.

Example:

```typescript
export const SETTINGS = {
	subscriptions: {
		'1015537': {
			webhookKeys: ['WEBHOOK_A'],
			roles: {
				WEBHOOK_A: ['704963547248703428', '130349517473811392'],
			},
			language: {
				WEBHOOK_A: 'en-us',
			},
		},
	},
} as const;
```

<sub>The `Role IDs` are randomly generated for demonstration purposes</sub>

Lastly, configure the language of the webhook. This will fetch the translated post from HoYoLAB and display it in the translated language in the webhook message. Use the respective abbreviation to configure the preferred language or you can leave the string blank and it will be defaulted as English. Make sure that every Webhook Alias has the `language` property. The list of supported languages and their abbreviation is as follow:

```
English: en-us
Chinese (Simplified): zh-cn
Chinese (Traditional): zh-tw
German: de-de
Spanish: es-es
French: fr-fr
Indonesian: id-id
Italian: it-it
Japanese: ja-jp
Korean: ko-kr
Portuguese: pt-pt
Russian: ru-ru
Thai: th-th
Turkish: tr-tr
Vietnamese: vi-vn
```

> [!IMPORTANT]
> Remove unwanted entries of `subscriptions` before deploying.

Finally, deploy this worker again before you configure Discord Webhooks.

```
npx wrangler deploy
```

## Configuring Discord Webhook

To configure a Discord Webhook and link it to this service, first go to your server and select a channel that the webhook will send its message to.

Click on Edit Channel, go to Integrations > Webhooks, and create a New Webhook (Or use an existing webhook). Then copy its Webhook URL.

Go to your Cloudflare Dashboard, Workers & Pages > KV, and open the `hyl-webhooks` namespace (or whatever you have named it previously with the same purpose). Then add an entry. The Key will be the `Webhook Alias` you have provided in the `user-config.ts` file, and the Value will be the `Webhook URL` you have copied from Discord. Once you are done, click Add Entry, and you should see the new entry showing up in the page.

Example:

![image](https://github.com/GamerYuan/hoyolab-discord-worker/blob/main/assets/WebhookKeys.png)

Now you have fully configured the service. You can add more accounts to follow and Webhook Aliases as you go, by modifying `user-config.ts` with the new entries.

## Configuring Token for API Tests

A secret `Token` has been implemented for API tests. You can test the individual functionalities of this service if you setup a token.

To setup a `Token`, type in the following commands:

```
npx wrangler secret put [TOKEN]

# Wait for a pop-up that asks for your TOKEN. The TOKEN you typed in will not be displayed in the terminal

npx wrangler deploy
```

### Available API tests

- `/[TOKEN]/test_fetch/:uid` : returns the fetched timeline for the specified UID
- `/[TOKEN]/test_kv/:uid` : returns the cached data for the specified UID
- `/[TOKEN]/test_webhook/?webhook=[Webhook Alias]` : sends a test message to the Webhook specified by the Webhook Alias on Discord
- `/[TOKEN]/test_post/:id` : returns the 500 word summary for the post specified by the ID.
- `/[TOKEN]/test_discord/:uid?webhook=[Webhook Alias]` : sends the last 10 articles of the user specified by the UID to the Webhook specified by the Webhook Alias on Discord

## Limitations

All Cloudflare Workers Limitations can be found in this [article](https://developers.cloudflare.com/workers/platform/limits/). The following will detail some limitations potentially impactful to this deployment.

### Worker KV

The free tier of `Worker KV` supports 100,000 Read Operations and 1000 Write Operations daily, shared across all `Workers` and `Pages` you have on your Cloudflare Account.

Each subscription incurs the following usage:

- 2 Read Operations:
  - Retrieve last sent post data
  - Retrieve Discord Webhook URL
- 1 Write Operation when sending a new batch of embeds

This totals to an average of 2880 Operations (Write Operations are negligible) daily if CRON Triggers are scheduled every minute (default). You can manage around 34 account `subscriptions` at this rate.

### Cron Triggers

The free tier of `Cloudflare Workers` supports 5 `CRON Triggers` total, shared across all `Workers`.

### Open Connections

The free tier of `Cloudflare Workers` supports up to 6 simultaneous open connections. Additional connections will be placed in a queue, incurring more CPU time. This may limit the maximum number of `subscriptions`.

### Discord Rate Limit

Discord has recently started to severely rate limit requests sent from Cloudflare Worker IPs. This may cause a delay in the webhook posts sent but the unsent/delayed posts will not be lost. Discord developers were made aware of this issue and is currently working on a fix.
