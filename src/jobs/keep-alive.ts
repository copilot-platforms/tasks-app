import { schedules } from '@trigger.dev/sdk/v3'

// This task does nothing except warm up our workers and ensure it stays active.
export const keepAlive = schedules.task({
  id: 'keep-alive',
  maxDuration: 10,
  cron: '* * * * *', // Run every 1 minutes till trigger gets their shiz together
  run: async () => {
    return { message: 'Worker is warm' }
  },
})
