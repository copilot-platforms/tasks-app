import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { handleWebhookEvent } from '@api/webhook/webhook.controller'

export const POST = withErrorHandler(handleWebhookEvent)
