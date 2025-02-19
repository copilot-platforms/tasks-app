import { saveAs } from 'file-saver'
import { useState } from 'react'

import { getFilePathFromUrl } from '@/utils/signedUrlReplacer'
import { SupabaseActions } from '@/utils/SupabaseActions'

export const useDownloadFile = () => {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async (src: string, fileName: string) => {
    try {
      setIsDownloading(true)
      const filePath = getFilePathFromUrl(src)
      if (!filePath) return
      const supabaseActions = new SupabaseActions()
      const blobData = await supabaseActions.downloadAttachment(filePath)

      if (blobData) {
        const blob = new Blob([blobData])
        saveAs(blob, fileName)
      }
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return { handleDownload, isDownloading }
}
