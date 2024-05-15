export const copilotAPIKey = process.env.COPILOT_API_KEY || ''
export const apiUrl = `${process.env.VERCEL_ENV === 'development' ? 'http://' : 'https://'}${process.env.VERCEL_URL}`
export const SentryConfig = {
  DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
}

export const supabaseProjectUrl = process.env.SUPABASE_PROJECT_URL || ''
export const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
