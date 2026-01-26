import { boolean, z } from 'zod'
import { FileTypes } from '@/types/interfaces'

export const CreateAttachmentRequestSchema = z
  .object({
    taskId: z.string().uuid().optional(),
    commentId: z.string().uuid().optional(),
    filePath: z.string(),
    fileSize: z.number(),
    fileType: z.string(),
    fileName: z.string(),
  })
  .refine((data) => !!data.taskId !== !!data.commentId, {
    message: 'Provide either taskId or commentId, but not both',
    path: ['taskId', 'commentId'],
  }) //XOR LOGIC for taskId and commentId.

export type CreateAttachmentRequest = z.infer<typeof CreateAttachmentRequestSchema>

export const AttachmentResponseSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid().nullable(),
  commentId: z.string().uuid().nullable(),
  workspaceId: z.string(),
  filePath: z.string(),
  fileSize: z.number(),
  fileType: z.nativeEnum(FileTypes),
  fileName: z.string(),
})

export type AttachmentResponseSchema = z.infer<typeof AttachmentResponseSchema>

export const CustomUploadBodySchema = z.object({
  type: z.string(),
  payload: z.object({
    pathname: z.string(),
    callbackUrl: z.string(),
    clientPayload: z.string(),
    multipart: z.boolean(),
  }),
})

export const CustomUploadPayloadSchema = z.object({
  data: z.string(),
})
