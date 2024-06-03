import { z } from 'zod'

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
