import { z } from 'zod'
import { ClientResponseSchema, InternalUsersSchema } from '@/types/common'

export const CommentAddedSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  initiatorId: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
})
export type CommendAddedDetails = z.infer<typeof CommentAddedSchema>

export const commentAddedResponseSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  initiatorId: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  replies: z.array(
    z.object({
      id: z.string().uuid(),
      content: z.string(),
      taskId: z.string().uuid(),
      parentId: z.string().uuid(),
      initiatorId: z.string().uuid(),
      workspaceId: z.string(),
      initiator: z.union([InternalUsersSchema, ClientResponseSchema]),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    }),
  ),
})
