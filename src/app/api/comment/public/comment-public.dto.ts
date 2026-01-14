import { RFC3339DateSchema } from '@/types/common'
import { AssigneeType } from '@prisma/client'
import z from 'zod'

export const PublicAttachmentDtoSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  downloadUrl: z.string().url(),
  uploadedBy: z.string().uuid(),
  uploadedByUserType: z.nativeEnum(AssigneeType).nullable(),
  uploadedDate: RFC3339DateSchema,
})
export type PublicAttachmentDto = z.infer<typeof PublicAttachmentDtoSchema>

export const PublicCommentDtoSchema = z.object({
  id: z.string().uuid(),
  object: z.literal('taskComment'),
  taskId: z.string().uuid(),
  parentCommentId: z.string().uuid().nullable(),
  content: z.string(),
  createdBy: z.string().uuid(),
  createdByUserType: z.nativeEnum(AssigneeType).nullable(),
  createdDate: RFC3339DateSchema,
  updatedDate: RFC3339DateSchema,
  attachments: z.array(PublicAttachmentDtoSchema).nullable(),
})
export type PublicCommentDto = z.infer<typeof PublicCommentDtoSchema>
