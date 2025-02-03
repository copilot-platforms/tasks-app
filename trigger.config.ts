import { defineConfig } from '@trigger.dev/sdk/v3'
import { z } from 'zod'

const project = z
  .string({ message: 'Must provide TRIGGER_PROJECT in environment to run background trigger.dev jobs' })
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
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ['./src/triggers'],
})
