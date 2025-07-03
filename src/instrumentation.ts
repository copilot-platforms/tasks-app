/**
 * Registers Sentry instrumentation based on the runtime environment.
 */
export const register = async (): Promise<void> => {
  const runtime = process.env.NEXT_RUNTIME as 'nodejs' | 'edge' | undefined
  if (runtime === 'nodejs') {
    await import('../sentry.server.config')
  } else if (runtime === 'edge') {
    await import('../sentry.edge.config')
  }
}
