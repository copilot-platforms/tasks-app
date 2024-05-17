import APIError from '@/app/api/core/exceptions/api'
import { SupabaseService } from '@/app/api/core/services/supabase.service'
import { supabaseBucket } from '@/config'
import httpStatus from 'http-status'
import { Url } from 'next/dist/shared/lib/router/router'
import React from 'react'

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

  async uploadAttachment(event: React.ChangeEvent<HTMLInputElement>, task_id: string) {
    const files = event.target.files
    let filePayload
    if (files && files.length > 0) {
      const file = files[0]
      const { data, error } = await this.supabase.storage.from(supabaseBucket).upload(file.name, file, {
        cacheControl: '3600',
        upsert: true,
      })
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
