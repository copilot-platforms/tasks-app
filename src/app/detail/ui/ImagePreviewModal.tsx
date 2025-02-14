import { StyledImagePreviewModal, StyledImagePreviewWrapper, StyledImageTopBar } from '@/app/detail/ui/styledComponent'
import { DownloadIconBlack, ImagePreviewIconPNG, ImagePreviewModalCloseIcon } from '@/icons'
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'
import { Box } from '@mui/material'
import { Dispatch, SetStateAction } from 'react'

import '@cyntler/react-doc-viewer/dist/index.css'

interface ImagePreviewModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  title?: string
  src?: string
}

export const ImagePreviewModal = ({ open, setOpen, title, src }: ImagePreviewModalProps) => {
  const docs = [{ uri: 'https://www.alleycat.org/wp-content/uploads/2019/03/FELV-cat.jpg' }]
  const closeModal = () => setOpen(false)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    console.log(e.target)
  }
  return (
    <StyledImagePreviewModal
      open={open}
      sx={{ width: '100vw' }}
      onClose={closeModal}
      aria-labelledby={'preview-image-' + (title || 'placeholder')?.toLocaleLowerCase().replaceAll(' ', '-')}
      aria-describedby="preview-image-modal-popup"
    >
      <>
        <StyledImageTopBar>
          <Box className="close-icon-container" onClick={closeModal}>
            <ImagePreviewModalCloseIcon />
          </Box>
          <Box className="title-container">
            <ImagePreviewIconPNG />
            {title ?? ''}
          </Box>
          <Box className="download-btn">
            <DownloadIconBlack />
          </Box>
        </StyledImageTopBar>
        <StyledImagePreviewWrapper onClick={handleBackdropClick}>
          <DocViewer
            documents={docs}
            pluginRenderers={DocViewerRenderers}
            theme={{
              primary: 'red',
              secondary: 'blue',
              tertiary: 'green',
              textPrimary: 'powderblue',
              textSecondary: 'pink',
            }}
          />
        </StyledImagePreviewWrapper>
      </>
    </StyledImagePreviewModal>
  )
}
