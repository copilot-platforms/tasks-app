import { prismaExtension } from '@trigger.dev/build/extensions/prisma'
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
      maxAttempts: 1,
      minTimeoutInMs: 1_000,
      maxTimeoutInMs: 15_000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ['./src/jobs'],
  build: {
    external: ['canvas', 'jsdom'],
    extensions: [
      prismaExtension({
        schema: 'prisma/schema/main.prisma',
        mode: 'legacy', //ref:https://trigger.dev/docs/config/extensions/prismaExtension
      }),

      // Untested, but can automatically sync Vercel env and trigger env using VERCEL_ACCESS_TOKEN, VERCEL_PROJECT_ID and VERCEL_TEAM_ID
      // import { syncVercelEnvVars } from "@trigger.dev/build/extensions/core";
      // syncVercelEnvVars(),
    ],
  },
})
