import React, { useRef, useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { CopilotTooltip } from './CopilotTooltip'

interface TaskTitleProps {
  title?: string
  variant?: 'board' | 'list' | 'subtasks'
}

const TaskTitle = ({ title, variant = 'board' }: TaskTitleProps) => {
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
          wordBreak: 'break-word',
        }}
      >
        {title}
      </Typography>
    ) : (
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
    )

  const TaskTitleComponent = () => {
    return <Box sx={{ overflow: 'hidden', wordBreak: 'break-word' }}>{title}</Box>
  }

  return isOverflowing ? (
    <Box sx={{ flexShrink: 1, minWidth: 0 }}>
      <CopilotTooltip content={<TaskTitleComponent />} allowMaxWidth={true}>
        {typographyComponent}
      </CopilotTooltip>
    </Box>
  ) : (
    typographyComponent
  )
}

export default TaskTitle
