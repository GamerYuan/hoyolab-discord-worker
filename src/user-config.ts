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
      },
      language: {
        WEBHOOK_A: 'en-us',
        WEBHOOK_B: 'zh-cn',
      },
    },
    'UID2': {
      webhookKeys: [
        'WEBHOOK_A',
      ],
      roles: {
        WEBHOOK_A: [],
      },
      language: {
        WEBHOOK_A: 'ja-jp',
      },
    },
  }, 
} as const