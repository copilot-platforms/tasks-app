import { boolean, z } from 'zod'

export const CreateAttachmentRequestSchema = z.object({
  taskId: z.string().uuid(),
  filePath: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  fileName: z.string(),
})

export type CreateAttachmentRequest = z.infer<typeof CreateAttachmentRequestSchema>

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
