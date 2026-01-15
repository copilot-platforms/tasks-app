import { ISignedUrlUpload } from '@/types/interfaces'
import { generateRandomString } from '@/utils/generateRandomString'
import { SupabaseActions } from '@/utils/SupabaseActions'
import { postScrapMedia } from '@/app/detail/[task_id]/[user_type]/actions'
import { ScrapMediaRequest } from '@/types/common'
import { getFilePathFromUrl } from '@/utils/signedUrlReplacer'

import { getSignedUrlFile, getSignedUrlUpload } from '@/app/(home)/actions'
import { CreateAttachmentRequestSchema } from '@/types/dto/attachments.dto'

const buildFilePath = (
  workspaceId: string,
  type: 'tasks' | 'templates' | 'comments',
  entityId: string | null,
  parentTaskId?: string,
) => {
  if (type === 'tasks') {
    return entityId ? `/${workspaceId}/${entityId}` : `/${workspaceId}`
  } else if (type === 'comments') {
    return `/${workspaceId}/${parentTaskId}/comments${entityId ? `/${entityId}` : ''}`
  }
  return `/${workspaceId}/templates${entityId ? `/${entityId}` : ''}`
}

export const uploadAttachmentHandler = async (
  file: File,
  token: string,
  workspaceId: string,
  entityId: string | null,
  type: 'tasks' | 'templates' | 'comments' = 'tasks',
  parentTaskId?: string,
): Promise<string | undefined> => {
  const supabaseActions = new SupabaseActions()

  const fileName = generateRandomString(file.name)
  const signedUrl: ISignedUrlUpload = await getSignedUrlUpload(
    token,
    fileName,
    buildFilePath(workspaceId, type, entityId, parentTaskId),
  )

  const { filePayload, error } = await supabaseActions.uploadAttachment(file, signedUrl, entityId)

  if (filePayload) {
    const url = await getSignedUrlFile(token ?? '', filePayload?.filePath ?? '')
    return url
  }

  if (error) {
    console.error('error uploading file :', error)
    return Promise.reject(new Error('File upload failed'))
  }
}

export const deleteEditorAttachmentsHandler = async (
  url: string,
  token: string,
  task_id: string | null,
  template_id: string | null,
) => {
  const filePath = getFilePathFromUrl(url)
  if (filePath) {
    const payload: ScrapMediaRequest = {
      filePath: filePath,
      taskId: task_id,
      templateId: template_id,
    }
    postScrapMedia(token, payload)
  }
}

export const getAttachmentPayload = (fileUrl: string, file: File, id: string, entity: 'tasks' | 'comments' = 'tasks') => {
  const filePath = getFilePathFromUrl(fileUrl)

  const payload = entity === 'comments' ? { commentId: id } : { taskId: id }

  return CreateAttachmentRequestSchema.parse({
    ...payload,
    filePath,
    fileSize: file.size,
    fileType: file.type,
    fileName: file.name,
  })
}

export const getFileNameFromPath = (path: string): string => {
  const segments = path.split('/').filter(Boolean)
  return segments[segments.length - 1] || ''
}
