import { PublicAttachmentDto, PublicCommentDto, PublicCommentDtoSchema } from '@/app/api/comment/public/comment-public.dto'
import { RFC3339DateSchema } from '@/types/common'
import { CommentWithAttachments } from '@/types/dto/comment.dto'
import { toRFC3339 } from '@/utils/dateHelper'
import { createSignedUrls } from '@/utils/signUrl'
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
      deletedDate: toRFC3339(comment.deletedAt),
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
    const attachmentPaths = attachments.map((attachment) => attachment.filePath)
    const signedUrls = await PublicCommentSerializer.getFormattedSignedUrls(attachmentPaths)

    return attachments.map((attachment) => {
      const url = signedUrls.find((item) => item.path === attachment.filePath)?.url
      return {
        id: attachment.id,
        fileName: attachment.fileName,
        fileSize: attachment.fileSize,
        mimeType: attachment.fileType,
        downloadUrl: attachment.deletedAt
          ? null
          : z
              .string()
              .url({ message: `Invalid downloadUrl for attachment with id ${attachment.id}` })
              .parse(url),
        uploadedBy,
        uploadedByUserType,
        uploadedDate: RFC3339DateSchema.parse(toRFC3339(attachment.createdAt)),
        deletedDate: toRFC3339(attachment.deletedAt),
      }
    })
  }

  static async serialize(comment: CommentWithAttachments): Promise<PublicCommentDto> {
    return PublicCommentDtoSchema.parse(await PublicCommentSerializer.serializeUnsafe(comment))
  }

  static async serializeMany(comments: CommentWithAttachments[]): Promise<PublicCommentDto[]> {
    const serializedComments = await Promise.all(comments.map(async (comment) => PublicCommentSerializer.serialize(comment)))
    return z.array(PublicCommentDtoSchema).parse(serializedComments)
  }

  static async getFormattedSignedUrls(attachmentPaths: string[]) {
    if (!attachmentPaths.length) return []
    const signedUrls = await createSignedUrls(attachmentPaths)
    return signedUrls.map((item) => ({ path: item.path, url: item.signedUrl }))
  }
}
