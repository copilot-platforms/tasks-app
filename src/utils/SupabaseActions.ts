import { supabaseBucket } from '@/config'
import { supabase } from '@/lib/supabase'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import React from 'react'

export async function downloadAttachment(filePath: string, fileName: string) {
  const { data, error } = await supabase.storage.from(supabaseBucket).download(filePath)
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

export async function uploadAttachment(event: React.ChangeEvent<HTMLInputElement>, task_id: string) {
  const files = event.target.files
  let filePayload
  if (files && files.length > 0) {
    const file = files[0]
    const { data, error } = await supabase.storage.from(supabaseBucket).upload(file.name, file, {
      cacheControl: '3600',
      upsert: true,
    })
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

export async function removeAttachment(id: string, filePath: string) {
  const { data, error } = await supabase.storage.from(supabaseBucket).remove([filePath])
  return { data }
}
