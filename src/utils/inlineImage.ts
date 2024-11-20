import { ISignedUrlUpload } from '@/types/interfaces'
import { generateRandomString } from '@/utils/generateRandomString'
import { SupabaseActions } from '@/utils/SupabaseActions'
import { postScrapImage } from '@/app/detail/[task_id]/[user_type]/actions'
import { ScrapImageRequest } from '@/types/common'
import { getFilePathFromUrl } from '@/utils/signedUrlReplacer'

import { getSignedUrlFile, getSignedUrlUpload } from '@/app/actions'

const buildFilePath = (workspaceId: string, taskId: string | null) => `/${workspaceId}${taskId ? `/${taskId}` : ''}`

export const uploadImageHandler = async (
  file: File,
  token: string,
  workspaceId: string,
  task_id: string | null,
): Promise<string | undefined> => {
  const supabaseActions = new SupabaseActions()

  const fileName = generateRandomString(file.name)
  const signedUrl: ISignedUrlUpload = await getSignedUrlUpload(token, fileName, buildFilePath(workspaceId, task_id))
  const { filePayload, error } = await supabaseActions.uploadAttachment(file, signedUrl, task_id)
  if (filePayload) {
    const url = await getSignedUrlFile(token ?? '', filePayload?.filePath ?? '')
    return url
  }

  if (error) {
    console.error('error uploading file :', error)
    return Promise.reject(new Error('File upload failed'))
  }
}

export const deleteEditorAttachmentsHandler = async (url: string, token: string, task_id: string | null) => {
  const filePath = getFilePathFromUrl(url)
  if (filePath) {
    const payload: ScrapImageRequest = {
      filePath: filePath,
      taskId: task_id,
    }
    postScrapImage(token, payload)
  }
}
