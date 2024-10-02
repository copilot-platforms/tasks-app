import { SupabaseActions } from '@/utils/SupabaseActions'
import React from 'react'
import { generateRandomString } from '@/utils/generateRandomString'
import { ISignedUrlUpload } from '@/types/interfaces'

import { postScrapImage } from '@/app/detail/[task_id]/[user_type]/actions'
import { ScrapImageRequest } from '@/types/common'
import { getFilePathFromUrl } from '@/utils/signedUrlReplacer'

import { getSignedUrlUpload, getSignedUrlFile } from '@/app/actions'

export const uploadImageHandler = async (file: File, token: string, task_id: string | null): Promise<string> => {
  const supabaseActions = new SupabaseActions()

  const fileName = generateRandomString(file.name)
  const signedUrl: ISignedUrlUpload = await getSignedUrlUpload(token, fileName)
  const { filePayload, error } = await supabaseActions.uploadAttachment(file, signedUrl, task_id)
  const url = await getSignedUrlFile(token ?? '', filePayload?.filePath ?? '')
  if (error) {
    console.error('error uploading file :', error)
  }
  return url
}

export const deleteEditorAttachmentsHandler = async (url: string, token: string, task_id: string | null) => {
  const filePath = await getFilePathFromUrl(url)
  if (filePath) {
    const payload: ScrapImageRequest = {
      filePath: filePath,
      taskId: task_id,
    }
    postScrapImage(token, payload)
  }
}
