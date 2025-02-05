import { logger, task, wait } from '@trigger.dev/sdk/v3'

export const healthCheck = task({
  id: 'health-check',
  maxDuration: 60,
  run: async (payload: any, { ctx }) => {
    logger.log('Checking health of trigger.dev tasks worker', { payload, ctx })

    // Check whether trigger, triggerAndWait, triggerAndPoll, etc work properly or not
    await wait.for({ seconds: 5 })

    return {
      message: 'Trigger.dev task workers are rolling!',
    }
  },
})
