import { getFilePathFromUrl } from '@/utils/signedUrlReplacer'
import { SupabaseActions } from '@/utils/SupabaseActions'
import { useState } from 'react'

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
        const url = window.URL.createObjectURL(new Blob([blobData]))

        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.download = fileName

        link.click()

        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return { handleDownload, isDownloading }
}
