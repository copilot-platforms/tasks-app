import { z } from 'zod'
import { AttachmentResponseSchema } from './attachments.dto'

export const CreateCommentSchema = z.object({
  content: z.string(),
  parentId: z.string().uuid().optional(),
  taskId: z.string().uuid(),
})

export type CreateComment = z.infer<typeof CreateCommentSchema>

export const UpdateCommentSchema = z.object({
  content: z.string(),
})

export type UpdateComment = z.infer<typeof UpdateCommentSchema>

export const CommentResponseSchema: z.ZodType = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    initiator: z.string(),
    initiatorId: z.string().uuid(),
    content: z.string(),
    parentId: z.string().uuid().nullable(),
    attachments: z.array(AttachmentResponseSchema),
    children: z.array(z.lazy(() => CommentResponseSchema)).default([]),
  }),
)

export type CommentResponse = z.infer<typeof CommentResponseSchema>
