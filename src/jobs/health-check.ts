import { logger, task } from '@trigger.dev/sdk/v3'

export const healthCheck = task({
  id: 'health-check',
  maxDuration: 60,
  queue: {
    concurrencyLimit: 25,
  },
  run: async (payload: any, { ctx }) => {
    logger.log('Checking health of trigger.dev tasks worker', { payload, ctx })

    return {
      message: 'Trigger.dev task workers are rolling!',
    }
  },
})
