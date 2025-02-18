import { DocRenderer } from '@cyntler/react-doc-viewer'
import { Box } from '@mui/material'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'

import { StyledImageRenderer, StyledZoomControls } from '@/app/detail/ui/styledComponent'
import { ZoomIcon, ZoomInIcon, ZoomOutIcon } from '@/icons'

const Controls = ({ zoomIn, zoomOut, resetTransform }: any) => {
  return (
    <StyledZoomControls>
      <Box className="control-btn" onClick={() => zoomOut()}>
        <ZoomOutIcon />
      </Box>
      <Box className="control-btn" onClick={() => resetTransform()}>
        <ZoomIcon />
      </Box>
      <Box className="control-btn" onClick={() => zoomIn()}>
        <ZoomInIcon />
      </Box>
    </StyledZoomControls>
  )
}

export const ImageRenderer: DocRenderer = ({ mainState: { currentDocument } }) => {
  if (!currentDocument) {
    return <></>
  }

  return (
    <StyledImageRenderer id="custom-image-renderer">
      <TransformWrapper initialScale={1} centerOnInit={true} limitToBounds={false}>
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Pass the functions as props to Controls */}
            <Controls zoomIn={zoomIn} zoomOut={zoomOut} resetTransform={resetTransform} />
            <TransformComponent>
              <img id="image-renderer" src={currentDocument.fileData as string} alt="Image preview" />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </StyledImageRenderer>
  )
}

ImageRenderer.fileTypes = [
  'png',
  'image/png',
  'jpg',
  'jpeg',
  'image/jpeg',
  'gif',
  'image/gif',
  'webp',
  'image/webp',
  'bmp',
  'image/bmp',
  'svg',
  'image/svg+xml',
]
ImageRenderer.weight = 1
