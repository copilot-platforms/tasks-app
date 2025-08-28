import React, { useRef, useEffect, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { CopilotTooltip } from './CopilotTooltip'

interface TaskTitleProps {
  title?: string
  variant?: 'board' | 'list' | 'subtasks'
  metaItems?: React.ReactNode
}

const TaskTitle = ({ title, variant = 'board', metaItems }: TaskTitleProps) => {
  const textRef = useRef<HTMLElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useEffect(() => {
    const element = textRef.current
    if (element) {
      const isTextOverflowing = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
      setIsOverflowing(isTextOverflowing)
    }
  }, [title])

  const typographyComponent =
    variant == 'board' ? (
      <Stack direction="row" alignItems={'flex-end'} overflow={'hidden'}>
        <Box sx={{ flexShrink: 1, minWidth: 0, overflow: 'hidden' }}>
          <CopilotTooltip content={title} allowMaxWidth={true} disabled={!isOverflowing}>
            <Typography
              ref={textRef}
              variant="bodyMd"
              sx={{
                color: (theme) => theme.color.gray[600],
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
              {metaItems && !isOverflowing && (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    verticalAlign: 'middle',
                    padding: '0px 0px 0px 6px',
                    gap: '6px',
                  }}
                >
                  {metaItems}
                </Box>
              )}
            </Typography>
          </CopilotTooltip>
        </Box>

        {isOverflowing && metaItems && (
          <Stack
            direction="row"
            sx={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              height: '6.3em',
              gap: '6px',
              left: `290px`,
            }}
          >
            {metaItems}
          </Stack>
        )}
      </Stack>
    ) : (
      <Box sx={{ flexShrink: 1, minWidth: 0, overflow: 'hidden' }}>
        <CopilotTooltip content={title} allowMaxWidth={true} disabled={!isOverflowing}>
          <Typography
            ref={textRef}
            variant="bodySm"
            sx={{
              lineHeight: variant == 'list' ? '22px' : '21px',
              fontSize: variant == 'list' ? '14px' : '13px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flexShrink: 1,
              flexGrow: 0,
              minWidth: 0,
            }}
          >
            {title}
          </Typography>
        </CopilotTooltip>{' '}
      </Box>
    )

  return typographyComponent
}

export default TaskTitle
