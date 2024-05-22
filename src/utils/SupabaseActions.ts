import APIError from '@/app/api/core/exceptions/api'
import { SupabaseService } from '@/app/api/core/services/supabase.service'
import { supabaseBucket } from '@/config'
import httpStatus from 'http-status'
import { Url } from 'next/dist/shared/lib/router/router'
import React from 'react'
import { generateRandomString } from '@/utils/generateRandomString'
import { ISignedUrlUpload } from '@/types/interfaces'

export class SupabaseActions extends SupabaseService {
  async downloadAttachment(filePath: string, fileName: string) {
    const { data, error } = await this.supabase.storage.from(supabaseBucket).download(filePath)
    if (error) {
      throw new APIError(httpStatus.BAD_REQUEST, error.message)
    }
    if (data) {
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  }

  async uploadAttachment(file: File, task_id: string, signedUrl: ISignedUrlUpload) {
    let filePayload
    const { data, error } = await this.supabase.storage
      .from(supabaseBucket)
      .uploadToSignedUrl(signedUrl.path, signedUrl.token, file)
    if (error) {
      throw new APIError(httpStatus.BAD_REQUEST, error.message)
    }
    if (data) {
      filePayload = {
        fileSize: file.size,
        fileName: file.name,
        fileType: file.type,
        taskId: task_id,
        filePath: data.path,
      }
    }
    return filePayload
  }

  async removeAttachment(id: string, filePath: string) {
    const { data, error } = await this.supabase.storage.from(supabaseBucket).remove([filePath])
    if (error) {
      throw new APIError(httpStatus.BAD_REQUEST, error.message)
    }
    return { data }
  }
}
