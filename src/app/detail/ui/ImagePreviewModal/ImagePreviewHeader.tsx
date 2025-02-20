import { IHeaderOverride } from '@cyntler/react-doc-viewer'
import { Box } from '@mui/material'

import { StyledImageTopBar } from '@/app/detail/ui/styledComponent'
import { useDownloadFile } from '@/hooks/useDownload'
import { DownloadIconBlack, ImagePreviewIconPNG, ImagePreviewModalCloseIcon } from '@/icons'
import { getFileNameFromSignedUrl } from '@/utils/signUrl'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { truncateText } from '@/utils/truncateText'

type DocViewerHeader = (
  state: Parameters<IHeaderOverride>[0],
  opts: {
    handleClose: () => unknown
  },
) => ReturnType<IHeaderOverride>

export const ImagePreviewHeader: DocViewerHeader = (state, { handleClose }) => {
  const { handleDownload } = useDownloadFile()
  const width = useWindowWidth()
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
        {width < 600 ? truncateText(fileName, 24) : fileName}
      </Box>
      <Box className="download-btn" onClick={downloadImage}>
        <DownloadIconBlack />
      </Box>
    </StyledImageTopBar>
  )
}
