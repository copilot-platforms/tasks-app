import { SupabaseActions } from '@/utils/SupabaseActions'
import React from 'react'
import { generateRandomString } from '@/utils/generateRandomString'
import { ISignedUrlUpload } from '@/types/interfaces'

import { postScrapImage } from '@/app/detail/[task_id]/[user_type]/actions'
import { ScrapImageRequest } from '@/types/common'
import { getFilePathFromUrl } from '@/utils/signedUrlReplacer'

import { getSignedUrlUpload, getSignedUrlFile } from '@/app/actions'

export const uploadImageHandler = async (file: File, token: string, task_id: string | null): Promise<string | undefined> => {
  const supabaseActions = new SupabaseActions()
  const fileName = generateRandomString(file.name)

  let retries = 3

  while (retries > 0) {
    try {
      const signedUrl: ISignedUrlUpload = await getSignedUrlUpload(token, fileName)
      const { filePayload, error } = await supabaseActions.uploadAttachment(file, signedUrl, task_id)

      if (filePayload) {
        const url = await getSignedUrlFile(token ?? '', filePayload?.filePath ?? '')
        return url
      }

      if (error) {
        throw new Error('File upload failed')
      }
    } catch (error) {
      console.error(`Attempt failed: ${3 - retries + 1}, error:`, error)
      retries -= 1

      if (retries === 0) {
        return Promise.reject(new Error('File upload failed after 3 attempts'))
      }
    }
  }
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
