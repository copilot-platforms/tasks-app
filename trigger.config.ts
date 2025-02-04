import { defineConfig } from '@trigger.dev/sdk/v3'
import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const project = z
  .string({ message: 'Must have TRIGGER_PROJECT in environment to run trigger jobs' })
  .parse(process.env.TRIGGER_PROJECT)

export default defineConfig({
  project,
  runtime: 'node',
  logLevel: 'log',
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1_000,
      maxTimeoutInMs: 15_000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ['./src/jobs'],
})
