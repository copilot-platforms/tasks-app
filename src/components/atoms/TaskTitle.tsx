import React, { useRef, useEffect, useState } from 'react'
import { Typography } from '@mui/material'
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
      const isTextOverflowing =
        variant == 'board' ? element.scrollHeight > element.clientHeight : element.scrollWidth > element.clientWidth
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
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100%',
        }}
      >
        {title}
      </Typography>
    )

  return isOverflowing ? <CopilotTooltip content={title}>{typographyComponent}</CopilotTooltip> : typographyComponent
}

export default TaskTitle
