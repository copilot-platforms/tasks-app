import { z } from 'zod'
import { AttachmentResponseSchema } from './attachments.dto'
import { Attachment, Comment } from '@prisma/client'

export const CreateCommentSchema = z.object({
  content: z.string(),
  parentId: z.string().uuid().optional(),
  taskId: z.string().uuid(),
  mentions: z.array(z.string().uuid()).optional(),
})

export type CreateComment = z.infer<typeof CreateCommentSchema>

export const UpdateCommentSchema = z
  .object({
    content: z.string().optional(),
    mentions: z.string().array().optional(),
    deletedAt: z.null().optional(),
  })
  .refine(({ content, deletedAt }) => deletedAt !== undefined || content !== undefined, {
    message: 'Content must be present to update comment',
    path: ['content'],
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
    replyCount: z.number(),
    children: z.array(z.lazy(() => CommentResponseSchema)).default([]),
  }),
)

export type CommentResponse = z.infer<typeof CommentResponseSchema>

export type CommentWithAttachments = Comment & { attachments: Attachment[] }

export type CommentsPublicFilterType = {
  taskId: string
  parentId?: string
  initiatorId?: string
  limit?: number
  lastIdCursor?: string
}
