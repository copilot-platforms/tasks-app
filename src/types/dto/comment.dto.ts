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
    content: z.string(),
    parentId: z.string().uuid().nullable(),
    taskId: z.string().uuid(),
    workspaceId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
    attachments: z.array(AttachmentResponseSchema),
    children: z.any(),
  }),
)

export type CommentResponse = z.infer<typeof CommentResponseSchema>
