import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'

import '@cyntler/react-doc-viewer/dist/index.css'

import { ImagePreviewHeader } from '@/app/detail/ui/ImagePreviewModal/ImagePreviewHeader'
import { StyledImagePreviewModal, StyledImagePreviewWrapper } from '@/app/detail/ui/styledComponent'
import { useDownloadFile } from '@/hooks/useDownload'
import { selectTaskDetails, setOpenImage } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'
import { useSelector } from 'react-redux'

export const ImagePreviewModal = () => {
  const { openImage } = useSelector(selectTaskDetails)
  const docs = [{ uri: openImage || '' }]
  const { handleDownload, isDownloading } = useDownloadFile()

  const handleClose = () => store.dispatch(setOpenImage(null))
  const handleBackdropClick = (e: React.MouseEvent<unknown, MouseEvent>) => {
    // 'image-renderer' is the id of transparent backdrop in DocViewer
    if ((e.target as HTMLDivElement | HTMLImageElement).id === 'image-renderer') {
      handleClose()
    }
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
              overrideComponent: (state) => ImagePreviewHeader(state, { handleClose, handleDownload, isDownloading }),
            },
          }}
        />
      </StyledImagePreviewWrapper>
    </StyledImagePreviewModal>
  )
}
