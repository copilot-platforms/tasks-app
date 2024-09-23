import { SupabaseActions } from '@/utils/SupabaseActions'
import React from 'react'
import { generateRandomString } from '@/utils/generateRandomString'
import { ISignedUrlUpload } from '@/types/interfaces'
import { getSignedUrlUpload } from '@/app/actions'
import { getSignedUrlFile, postScrapImage } from '@/app/detail/[task_id]/[user_type]/actions'
import { ScrapImageRequest } from '@/types/common'
import { getFilePathFromUrl } from '@/utils/signedUrlReplacer'

export const uploadImageHandler = async (file: File, token: string, task_id?: string): Promise<string> => {
  const supabaseActions = new SupabaseActions()
  const fileName = generateRandomString(file.name)

  const signedUrl: ISignedUrlUpload = await getSignedUrlUpload(token, fileName)
  const filePayload = await supabaseActions.uploadAttachment(file, signedUrl, task_id)
  const url = await getSignedUrlFile(token ?? '', filePayload?.filePath ?? '')

  return url
}

export const deleteEditorAttachmentsHandler = async (url: string, token: string, task_id?: string) => {
  const filePath = await getFilePathFromUrl(url)
  if (filePath) {
    const payload: ScrapImageRequest = {
      filePath: filePath,
      taskId: task_id ? task_id : null,
    }
    postScrapImage(token, payload)
  }
}
