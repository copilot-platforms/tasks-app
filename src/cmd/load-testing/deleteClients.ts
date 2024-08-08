import { CopilotAPI } from '@/utils/CopilotAPI'
import Bottleneck from 'bottleneck'
import dotenv from 'dotenv'
import { z } from 'zod'
dotenv.config()

const run = async () => {
  if (process.env.VERCEL_ENV === 'production') {
    console.error("It's a bad idea to run this in prod.")
    return
  }

  const token = z.string().parse(process.env.LOAD_TESTING_COPILOT_TOKEN)
  const apiKey = z.string().parse(process.env.COPILOT_API_KEY)
  const copilot = new CopilotAPI(token, apiKey)
  const clients = await copilot.getClients({ limit: 10_000 })
  console.log('Clients:', clients.data?.length)

  if (!clients.data) {
    throw new Error('No clients to delete')
  }

  const deletePromises = []
  const bottleneck = new Bottleneck({
    minTime: 250,
    maxConcurrent: 4,
  })

  for (let client of clients.data) {
    if (client.email.startsWith('loadtest_')) {
      deletePromises.push(
        bottleneck.schedule(() => {
          console.info('Deleting client', client.givenName, 'with ID', client.id)
          return copilot.deleteClient(client.id)
        }),
      )
    }
  }

  await Promise.all(deletePromises)
}

run()
