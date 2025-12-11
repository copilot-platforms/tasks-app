// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

Sentry.setTag('app_env', isProd ? 'production' : 'preview')

if (dsn) {
  Sentry.init({
    dsn,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: isProd ? 0.1 : 1,
    // NOTE: reducing sample only 10% of transactions in prod to get general trends instead of detailed and overfitted data

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    replaysOnErrorSampleRate: 1.0,

    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    // NOTE: Since session replay barely helps us anyways, getting rid of it to reduce some bundle size at least
    replaysSessionSampleRate: 0,
    // integrations: [
    //   Sentry.replayIntegration({
    // Additional Replay configuration goes in here, for example:
    //     maskAllText: true,
    //     blockAllMedia: true,
    //   }),
    // ],

    // ignoreErrors: [/fetch failed/i],
    ignoreErrors: [/fetch failed/i],
  })
}
