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