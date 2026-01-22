import { PublicAttachmentDto } from '@/app/api/attachments/public/public.dto'
import { RFC3339DateSchema } from '@/types/common'
import { toRFC3339 } from '@/utils/dateHelper'
import { createSignedUrls } from '@/utils/signUrl'
import { Attachment, CommentInitiator } from '@prisma/client'
import z from 'zod'

export class PublicAttachmentSerializer {
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
    uploadedBy?: string
  }): Promise<PublicAttachmentDto[]> {
    const attachmentPaths = attachments.map((attachment) => attachment.filePath)
    const signedUrls = await PublicAttachmentSerializer.getFormattedSignedUrls(attachmentPaths)

    return attachments.map((attachment) => {
      const url = signedUrls.find((item) => item.path === attachment.filePath)?.url
      return {
        id: attachment.id,
        fileName: attachment.fileName,
        fileSize: attachment.fileSize,
        mimeType: attachment.fileType,
        downloadUrl: z
          .string()
          .url({ message: `Invalid downloadUrl for attachment with id ${attachment.id}` })
          .parse(url),
        uploadedBy: uploadedBy || attachment.createdById,
        uploadedByUserType: uploadedByUserType,
        uploadedDate: RFC3339DateSchema.parse(toRFC3339(attachment.createdAt)),
        deletedDate: attachment.deletedAt ? RFC3339DateSchema.parse(toRFC3339(attachment.deletedAt)) : null,
      }
    })
  }

  static async getFormattedSignedUrls(attachmentPaths: string[]) {
    if (!attachmentPaths.length) return []
    const signedUrls = await createSignedUrls(attachmentPaths)
    return signedUrls.map((item) => ({ path: item.path, url: item.signedUrl }))
  }
}
