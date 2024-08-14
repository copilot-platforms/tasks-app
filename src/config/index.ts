export const copilotAPIKey = process.env.COPILOT_API_KEY || ''
export const tasksAppId = process.env.COPILOT_TASKS_APP_ID || ''

export const apiUrl = `${process.env.VERCEL_ENV === 'development' ? 'http://' : 'https://'}${process.env.VERCEL_URL}`
export const isProd = process.env.VERCEL_ENV === 'production'
export const SentryConfig = {
  DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
}
export const advancedFeatureFlag = !!+(process.env.NEXT_PUBLIC_ADVANCED_FEATURES_FLAG || 0)

export const supabaseProjectUrl = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL || ''
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
export const supabaseBucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || ''
