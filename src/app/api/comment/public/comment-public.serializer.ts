import { PublicAttachmentDto, PublicCommentDto, PublicCommentDtoSchema } from '@/app/api/comment/public/comment-public.dto'
import { RFC3339DateSchema } from '@/types/common'
import { CommentWithAttachments } from '@/types/dto/comment.dto'
import { toRFC3339 } from '@/utils/dateHelper'
import { getSignedUrl } from '@/utils/signUrl'
import { Attachment, CommentInitiator } from '@prisma/client'
import { z } from 'zod'

export class PublicCommentSerializer {
  static async serializeUnsafe(comment: CommentWithAttachments): Promise<PublicCommentDto> {
    return {
      id: comment.id,
      object: 'taskComment',
      parentCommentId: comment.parentId,
      taskId: comment.taskId,
      content: comment.content,
      createdBy: comment.initiatorId,
      createdByUserType: comment.initiatorType,
      createdDate: RFC3339DateSchema.parse(toRFC3339(comment.createdAt)),
      updatedDate: RFC3339DateSchema.parse(toRFC3339(comment.updatedAt)),
      attachments: await PublicCommentSerializer.serializeAttachments({
        attachments: comment.attachments,
        uploadedByUserType: comment.initiatorType,
        uploadedBy: comment.initiatorId,
      }),
    }
  }

  /**
   *
   * @param attachments array of Attachment
   * @param uploadedBy id of the one who commented
   * @param uploadedByUserType usertype of the one who commented
   * @returns Array of PublicAttachmentDto
   */
  static async serializeAttachments({
    attachments,
    uploadedByUserType,
    uploadedBy,
  }: {
    attachments: Attachment[]
    uploadedByUserType: CommentInitiator | null
    uploadedBy: string
  }): Promise<PublicAttachmentDto[]> {
    const promises = attachments.map(async (attachment) => ({
      id: attachment.id,
      fileName: attachment.fileName,
      fileSize: attachment.fileSize,
      mimeType: attachment.fileType,
      downloadUrl: z
        .string({
          message: `Invalid downloadUrl for attachment with id ${attachment.id}`,
        })
        .parse(await getSignedUrl(attachment.filePath)),
      uploadedBy,
      uploadedByUserType,
      uploadedDate: RFC3339DateSchema.parse(toRFC3339(attachment.createdAt)),
    }))
    return await Promise.all(promises)
  }

  static async serialize(comment: CommentWithAttachments): Promise<PublicCommentDto> {
    return PublicCommentDtoSchema.parse(await PublicCommentSerializer.serializeUnsafe(comment))
  }

  static async serializeMany(comments: CommentWithAttachments[]): Promise<PublicCommentDto[]> {
    const serializedComments = await Promise.all(comments.map(async (comment) => PublicCommentSerializer.serialize(comment)))
    return z.array(PublicCommentDtoSchema).parse(serializedComments)
  }
}
