import { z } from 'zod'

export const CommentAddedSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  initiatorId: z.string().uuid(),
})
