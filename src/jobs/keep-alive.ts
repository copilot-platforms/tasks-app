import { schedules } from '@trigger.dev/sdk/v3'

// This task does nothing except warm up our workers and ensure it stays active.
const keepAlive = schedules.task({
  id: 'keep-alive',
  maxDuration: 10,
  cron: '*/2 * * * *',
  run: async () => {
    return { message: 'Worker is warm' }
  },
})

// We no longer have to rely on keepAlive to warm our job runners after trigger platform v4
// export { keepAlive }
