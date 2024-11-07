import { SupabaseActions } from '@/utils/SupabaseActions'
import React from 'react'
import { generateRandomString } from '@/utils/generateRandomString'
import { ISignedUrlUpload } from '@/types/interfaces'

import { postScrapImage } from '@/app/detail/[task_id]/[user_type]/actions'
import { ScrapImageRequest } from '@/types/common'
import { getFilePathFromUrl } from '@/utils/signedUrlReplacer'

import { getSignedUrlUpload, getSignedUrlFile } from '@/app/actions'

export const uploadAttachmentHandler = async (
  file: File,
  token: string,
  workspaceId: string,
  task_id: string | null,
): Promise<string | undefined> => {
  const supabaseActions = new SupabaseActions()
  const filePath = `/${workspaceId}${task_id ? `/${task_id}` : ''}`
  const fileName = generateRandomString(file.name)
  const signedUrl: ISignedUrlUpload = await getSignedUrlUpload(token, filePath, fileName)
  const { filePayload, error } = await supabaseActions.uploadAttachment(file, signedUrl, workspaceId, task_id)

  if (filePayload) {
    const url = await getSignedUrlFile(token ?? '', `${filePath}/${filePayload.filePath}`)
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
