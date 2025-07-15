import { ClientResponseSchema, InternalUsersSchema } from '@/types/common'
import { z } from 'zod'

export const CommentAddedSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1),
  initiatorId: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
})
export type CommendAddedDetails = z.infer<typeof CommentAddedSchema>

export const commentAddedResponseSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1),
  initiatorId: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  replies: z.array(
    z.object({
      id: z.string().uuid(),
      content: z.string().min(1),
      taskId: z.string().uuid(),
      parentId: z.string().uuid(),
      initiatorId: z.string().uuid(),
      workspaceId: z.string(),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    }),
  ),
})

export type CommentAddedResponse = z.infer<typeof commentAddedResponseSchema>
export type ReplyResponse = CommentAddedResponse['replies'][number]
