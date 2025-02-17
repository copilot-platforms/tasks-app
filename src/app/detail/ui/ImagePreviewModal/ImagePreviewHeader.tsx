import { Box } from '@mui/material'

import { StyledImageTopBar } from '@/app/detail/ui/styledComponent'
import { DownloadIconBlack, ImagePreviewIconPNG, ImagePreviewModalCloseIcon } from '@/icons'
import { IHeaderOverride } from '@cyntler/react-doc-viewer'
import { getFileNameFromSignedUrl } from '@/utils/signUrl'

type DocViewerHeader = (
  state: Parameters<IHeaderOverride>[0],
  actions: {
    handleClose: () => unknown
  },
) => ReturnType<IHeaderOverride>

export const ImagePreviewHeader: DocViewerHeader = (state, { handleClose }) => {
  console.log('url state', state)
  let fileName = getFileNameFromSignedUrl(state.currentDocument?.uri || '')
  if (fileName.length > 37) {
    // Prefixed with uuid & underscore
    fileName = fileName.slice(37)
  }
  return (
    <StyledImageTopBar>
      <Box className="close-icon-container" onClick={handleClose}>
        <ImagePreviewModalCloseIcon />
      </Box>
      <Box className="title-container">
        <ImagePreviewIconPNG />
        {fileName}
      </Box>
      <Box className="download-btn">
        <DownloadIconBlack />
      </Box>
    </StyledImageTopBar>
  )
}
