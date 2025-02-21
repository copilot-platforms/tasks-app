import DocViewer from '@cyntler/react-doc-viewer'
import { Box, CircularProgress } from '@mui/material'
import { useSelector } from 'react-redux'

import '@cyntler/react-doc-viewer/dist/index.css'

import { ImagePreviewHeader } from '@/app/detail/ui/ImagePreviewModal/ImagePreviewHeader'
import { ImageRenderer } from '@/app/detail/ui/ImagePreviewModal/ImageRenderer'
import { StyledImagePreviewModal, StyledImagePreviewWrapper } from '@/app/detail/ui/styledComponent'
import { MiniLoader } from '@/components/atoms/MiniLoader'
import { selectTaskDetails, setOpenImage } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'

export const ImagePreviewModal = () => {
  const { openImage } = useSelector(selectTaskDetails)
  const docs = [{ uri: openImage || '' }]

  const handleClose = () => store.dispatch(setOpenImage(null))
  const handleBackdropClick = (e: React.MouseEvent<unknown, MouseEvent>) => {
    if ((e.target as HTMLDivElement | HTMLImageElement)?.className?.includes('react-transform-wrapper')) {
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
          pluginRenderers={[ImageRenderer]}
          config={{
            header: {
              // Currently not supporting previousDocument / nextDocument args (single image preview only)
              overrideComponent: (state) => ImagePreviewHeader(state, { handleClose }),
            },
            loadingRenderer: {
              overrideComponent: () => (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <CircularProgress sx={{ color: 'white' }} size={48} />
                </Box>
              ),
            },
          }}
        />
      </StyledImagePreviewWrapper>
    </StyledImagePreviewModal>
  )
}
