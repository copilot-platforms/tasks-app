import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'
import { Dispatch, SetStateAction } from 'react'

import '@cyntler/react-doc-viewer/dist/index.css'

import { ImagePreviewHeader } from '@/app/detail/ui/ImagePreviewModal/ImagePreviewHeader'
import { StyledImagePreviewModal, StyledImagePreviewWrapper } from '@/app/detail/ui/styledComponent'
import { getFileNameFromSignedUrl } from '@/utils/signUrl'

interface ImagePreviewModalProps {
  openImage: string | null
  setOpenImage: Dispatch<SetStateAction<string | null>>
}

export const ImagePreviewModal = ({ openImage, setOpenImage }: ImagePreviewModalProps) => {
  const docs = [{ uri: openImage || '' }]

  const handleClose = () => setOpenImage(null)
  const handleBackdropClick = (e: React.MouseEvent<unknown, MouseEvent>) => {
    // 'image-renderer' is the id of transparent backdrop in DocViewer
    if ((e.target as HTMLDivElement | HTMLImageElement).id === 'image-renderer') {
      handleClose()
    }
  }

  const handleDownload = () => {
    if (!openImage) return

    const link = document.createElement('a')
    link.href = openImage
    link.download = getFileNameFromSignedUrl(openImage)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <StyledImagePreviewModal
      open={!!openImage}
      sx={{ width: '100vw' }}
      onClose={handleClose}
      aria-labelledby={'preview-image-modal'}
      aria-describedby="preview-image-modal-popup"
    >
      <StyledImagePreviewWrapper onClick={handleBackdropClick}>
        <DocViewer
          documents={docs}
          pluginRenderers={DocViewerRenderers}
          config={{
            header: {
              // Currently not supporting previousDocument / nextDocument args (single image preview only)
              overrideComponent: (state) => ImagePreviewHeader(state, { handleClose, handleDownload }),
            },
          }}
        />
      </StyledImagePreviewWrapper>
    </StyledImagePreviewModal>
  )
}
