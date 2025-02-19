'use client'

import { DocRenderer } from '@cyntler/react-doc-viewer'
import { Box } from '@mui/material'
import { useState } from 'react'
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
  const [imgLoaded, setImgLoaded] = useState(false)

  if (!currentDocument) {
    return <></>
  }

  return (
    <StyledImageRenderer id="custom-image-renderer">
      <TransformWrapper initialScale={1} centerOnInit={true}>
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <Controls zoomIn={zoomIn} zoomOut={zoomOut} resetTransform={resetTransform} />
            <TransformComponent>
              {/* Use img tag so as not to size-optimize zoomable image */}
              {/* eslint-disable-next-line */}
              <img
                id="image-renderer"
                src={currentDocument.fileData as string}
                alt="Image preview"
                onLoad={() => setImgLoaded(true)}
                style={{
                  opacity: imgLoaded ? 1 : 0,
                  // This transition is not just for show, the image flickers for a split second and this is to hide it
                  transition: 'opacity 0.35s ease-in-out',
                }}
              />
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
]
ImageRenderer.weight = 1
