import { PublicAttachmentSerializer } from '@/app/api/attachments/public/public.serializer'
import { PublicCommentDto, PublicCommentDtoSchema } from '@/app/api/comments/public/public.dto'
import { RFC3339DateSchema } from '@/types/common'
import { CommentWithAttachments } from '@/types/dto/comment.dto'
import { toRFC3339 } from '@/utils/dateHelper'
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
      attachments: await PublicAttachmentSerializer.serializeAttachments({
        attachments: comment.attachments,
        uploadedByUserType: comment.initiatorType,
        uploadedBy: comment.initiatorId,
        content: comment.content,
      }),
    }
  }

  static async serialize(comment: CommentWithAttachments): Promise<PublicCommentDto> {
    return PublicCommentDtoSchema.parse(await PublicCommentSerializer.serializeUnsafe(comment))
  }

  static async serializeMany(comments: CommentWithAttachments[]): Promise<PublicCommentDto[]> {
    const serializedComments = await Promise.all(comments.map(async (comment) => PublicCommentSerializer.serialize(comment)))
    return z.array(PublicCommentDtoSchema).parse(serializedComments)
  }
}
