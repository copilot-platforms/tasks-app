import APIError from '@/app/api/core/exceptions/api'
import { SupabaseService } from '@/app/api/core/services/supabase.service'
import { supabaseBucket } from '@/config'
import httpStatus from 'http-status'

import { ISignedUrlUpload } from '@/types/interfaces'

export class SupabaseActions extends SupabaseService {
  async downloadAttachment(filePath: string) {
    const { data, error } = await this.supabase.storage.from(supabaseBucket).download(filePath)
    if (error) {
      throw new APIError(httpStatus.BAD_REQUEST, error.message)
    }
    return data
  }

  async uploadAttachment(file: File, signedUrl: ISignedUrlUpload, workspaceId: string, task_id: string | null) {
    let filePayload
    const filePath = `/${workspaceId}${task_id ? `/${task_id}` : ''}`

    const { data, error } = await this.supabase.storage
      .from(`${supabaseBucket}/${filePath}`)
      .uploadToSignedUrl(signedUrl.path, signedUrl.token, file)

    if (error) {
      console.error('unable to upload the file', error)
    }
    if (data) {
      filePayload = {
        fileSize: file.size,
        fileName: file.name,
        fileType: file.type,
        taskId: task_id ?? '',
        filePath: data.path,
      }
    }

    return { filePayload, error }
  }

  async removeAttachment(filePath: string) {
    const { data, error } = await this.supabase.storage.from(supabaseBucket).remove([filePath])
    if (error) {
      throw new APIError(httpStatus.BAD_REQUEST, error.message)
    }
    return { data }
  }

  async moveAttachment(oldPath: string, newPath: string) {
    const { data, error } = await this.supabase.storage.from(supabaseBucket).move(oldPath, newPath)
    if (error) {
      throw new APIError(httpStatus.BAD_REQUEST, error.message)
    }
  }
}
