import { AttachmentTypes } from '@/types/interfaces'
import { uploadAttachmentHandler } from './attachmentUtils'

interface UploadConfig {
  token: string
  workspaceId?: string
  getEntityId?: () => string | null
  attachmentType?: AttachmentTypes
  parentTaskId?: string
  onUploadStart?: () => void
  onUploadEnd?: () => void
  onSuccess?: (fileUrl: string, file: File) => void | Promise<void>
}

export const createUploadFn = (config: UploadConfig) => {
  return async (file: File) => {
    config.onUploadStart?.()
    const entityId = config.getEntityId?.() ?? null //lazily loading the entityId because some of the ids are optimistic id and we want the real ids of comments/replies
    try {
      const fileUrl = await uploadAttachmentHandler(
        file,
        config.token,
        config?.workspaceId ?? '',
        entityId ?? null,
        config.attachmentType,
        config.parentTaskId,
      )

      if (fileUrl) {
        await config.onSuccess?.(fileUrl, file)
      }

      return fileUrl
    } finally {
      config.onUploadEnd?.()
    }
  }
}
