import { IHeaderOverride } from '@cyntler/react-doc-viewer'
import { Box } from '@mui/material'

import { StyledImageTopBar } from '@/app/detail/ui/styledComponent'
import { DownloadIconBlack, ImagePreviewIconPNG, ImagePreviewModalCloseIcon } from '@/icons'
import { getFileNameFromSignedUrl } from '@/utils/signUrl'

type DocViewerHeader = (
  state: Parameters<IHeaderOverride>[0],
  opts: {
    handleClose: () => unknown
    handleDownload: (src: string, fileName: string) => unknown
  },
) => ReturnType<IHeaderOverride>

export const ImagePreviewHeader: DocViewerHeader = (state, { handleClose, handleDownload }) => {
  const imageUrl = state.currentDocument?.uri
  if (!imageUrl) return <></>

  let fileName = getFileNameFromSignedUrl(imageUrl)
  if (fileName.length > 37) {
    // Prefixed with uuid & underscore
    fileName = fileName.slice(37)
  }
  const downloadImage = () => handleDownload(imageUrl, fileName)

  return (
    <StyledImageTopBar>
      <Box className="close-icon-container" onClick={handleClose}>
        <ImagePreviewModalCloseIcon />
      </Box>
      <Box className="title-container">
        <ImagePreviewIconPNG />
        {fileName}
      </Box>
      <Box className="download-btn" onClick={downloadImage}>
        <DownloadIconBlack />
      </Box>
    </StyledImageTopBar>
  )
}
