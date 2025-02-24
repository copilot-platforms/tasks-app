import { IHeaderOverride } from '@cyntler/react-doc-viewer'
import { Box } from '@mui/material'

import { StyledImageTopBar } from '@/app/detail/ui/styledComponent'
import { Tooltip } from '@/components/atoms/Tooltip'
import { useDownloadFile } from '@/hooks/useDownload'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { DownloadIconBlack, ImagePreviewIconPNG, ImagePreviewModalCloseIcon } from '@/icons'
import { getFileNameFromSignedUrl } from '@/utils/signUrl'
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
      <Tooltip title="Close">
        <Box className="close-icon-container" onClick={handleClose}>
          <ImagePreviewModalCloseIcon />
        </Box>
      </Tooltip>
      <Box className="title-container">
        <ImagePreviewIconPNG />
        {width < 600 ? truncateText(fileName, 24) : fileName}
      </Box>
      <Tooltip title="Download">
        <Box className="download-btn" onClick={downloadImage}>
          <DownloadIconBlack />
        </Box>
      </Tooltip>
    </StyledImageTopBar>
  )
}
