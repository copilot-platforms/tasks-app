import { schedules } from '@trigger.dev/sdk/v3'

export const keepAlive = schedules.task({
  id: 'keep-alive',
  maxDuration: 10,
  cron: '* * * * *',
  run: async () => {
    // This task does nothing except warm up our workers and ensure it stays active.
    return { message: 'Worker is warm' }
  },
})
