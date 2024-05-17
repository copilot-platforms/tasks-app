import { z } from 'zod'

export const CreateAttachmentRequestSchema = z.object({
  taskId: z.string().uuid(),
  url: z.string(),
})

export type CreateAttachmentRequest = z.infer<typeof CreateAttachmentRequestSchema>
