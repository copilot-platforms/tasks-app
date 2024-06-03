import { boolean, z } from 'zod'
import { FileTypes } from '@/types/interfaces'

export const CreateAttachmentRequestSchema = z.object({
  taskId: z.string().uuid().optional().nullish(),
  commentId: z.string().uuid().optional().nullish(),
  filePath: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  fileName: z.string(),
})

export type CreateAttachmentRequest = z.infer<typeof CreateAttachmentRequestSchema>

export const AttachmentResponseSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  workspaceId: z.string().uuid(),
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
