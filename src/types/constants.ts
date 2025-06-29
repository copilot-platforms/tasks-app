/**
 * Maximum character limits for truncation in various UI elements.
 */
export const TruncateMaxNumber = {
  SELECTOR: 16,
  CLIENT_TASK_DESCRIPTION: 256,
  ACTIVITY_LOG_TITLE_UPDATED: 32,
} as const

export type TruncateMaxNumber = (typeof TruncateMaxNumber)[keyof typeof TruncateMaxNumber]
