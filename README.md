# hoyolab-discord-worker

*This repository has been adapted and modified from [worker-bilibili-discord](https://github.com/UnluckyNinja/worker-bilibili-discord) by UnluckyNinja*

With this repository, you can receive post notifications from HoYoLAB as webhook messages in Discord.

Cloudflare Workers is a freemium network service by Cloudflare. You can host your services for free on Cloudflare Workers with some quota limitations. [Learn more](https://workers.cloudflare.com/)

# SETUP

First register an account on [Cloudflare](https://www.cloudflare.com/en-gb/).

Then install [Node.js](https://nodejs.org/en) on your local machine.

These are required to deploy this repository to Cloudflare Workers.

Finally clone this repository to your local machine:

```
git clone https://github.com/GamerYuan/hoyolab-discord-worker.git
```

# INSTALLING

Open a Terminal in the local repository folder. Then login to Cloudflare:
```
npx wrangler login
```

Then open [Cloudflare Workers Dashboard](https://dash.cloudflare.com/) on your browser

Head over to Workers & Pages > KV, and create 2 new namespaces: **hyl-post-cache** and **hyl-webhook**
*You can choose a different name as long as they serve their purpose*

Then copy their IDs and open wrangler.toml in the local repository folder.

```
name = "hoyolab-discord-worker"
main = "src/worker.ts"
compatibility_date = "2023-05-15"

[[kv_namespaces]]
binding = "POST_CACHE"
id = "4797a5b5ec8c4363837b6b34e14a7f01" # <-- change this to the ID of hyl-post-cache

[[kv_namespaces]]
binding = "WEBHOOKS"
id = "b744a7f186f1413f9f88e882263bcdae" # <-- change this to the ID of hyl-webhook

[triggers]
crons = ["* * * * *"] # * * * * * = run every minute
```

Change the ID of **POST_CACHE** and **WEBHOOKS** kv_namespaces to the newly created KV Namespaces respectively

You can also change the crons (timed trigger) if you do not wish to update the feed every minute. See this [article](https://developers.cloudflare.com/workers/configuration/cron-triggers/) for cron syntax.

Then open `src/user-config.ts` and configure the accounts to follow and webhooks to use.

```
export const SETTINGS = {
    subscriptions: {
      'UID1': {
        webhookKeys: [
          'WEBHOOK_A',
          'WEBHOOK_B',
        ],
        roles: {
          WEBHOOK_A: ['RoleID1'],
          WEBHOOK_B: [], //no ping
        }
      },
      'UID2': {
        webhookKeys: [
          'WEBHOOK_A',
        ],
        roles: {
          WEBHOOK_A: [],
        }
      },
    }, 
  } as const
```

To follow an account, change their UID field with the account ID. This can be found in the URL bar in the user's account page:
<img width="283" alt="image" src="https://github.com/GamerYuan/hoyolab-discord-worker/assets/99809097/44551863-2b1e-4aa2-bffc-0a91b9357c75">

Then, configure the webhookKeys. You should use an alias which represents which Webhook(s) you want the notification to be sent to.

Lastly, configure the roles. You can put a Role ID in your Discord server for each webhook, the roles specified will be pinged as the notification is sent. [Learn more](https://www.itgeared.com/how-to-get-role-id-on-discord). You can add multiple roles and separate them by `,`, or leave it empty such that no roles will be pinged as the notification is sent.

Make sure to remove unwanted entries of **subscriptions** before deploying.

Finally, deploy this worker before you configure Discord Webhooks.
```
npx wrangler deploy
```

# CONFIGURING DISCORD WEBHOOKS

To configure a Discord Webhook and link it to this service, first go to your server and select a channel that the webhook will send its message to. 

Click on Edit Channel, go to Integrations > Webhooks, and create a New Webhook (Or use an existing webhook). Then copy its Webhook URL.

Go to your Cloudflare Dashboard, Workers & Pages > KV, and open the **hyl-webhooks** namespace (or whatever you have named it previously with the same purpose). Then add an entry. The Key will be the **Webhook Alias** you have configured in the `user-config.ts` file, and the Value will be the **Webhook URL** you have copied from Discord. Once you are done, click Add Entry, and you should see the new entry showing up in the page.

Now you have fully configured the service. You can add more accounts to follow and Webhook Aliases as you go, by modifying `user-config.ts` with the new entries.

# CONFIGURING TOKEN FOR API TESTS

A secret Token has been implemented for API tests. You can test the individual functionalities of this service if you setup a token. 

To setup a Token, type in the following commands:
```
npx wrangler secret put TOKEN

# Wait for a pop-up that asks for your TOKEN. The TOKEN you typed in will not be displayed in the terminal

npx wrangler deploy
```

## Available API tests
- `/TOKEN/test_fetch/:uid` : returns the fetched timeline for the specified UID
- `/TOKEN/test_kv/:uid` : returns the cached data for the specified UID
- `/TOKEN/test_webhook/?webhook=[Webhook Alias]` : sends a test message to the Webhook specified by the Webhook Alias on Discord
- `/TOKEN/test_post/:id` : returns the 500 word summary for the post specified by the ID.
- `/TOKEN/test_discord/:uid?webhook=[Webhook Alias]` : sends the last 10 articles of the user specified by the UID to the Webhook specified by the Webhook Alias on Discord
