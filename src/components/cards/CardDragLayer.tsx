import { Box, Stack, Typography } from '@mui/material'
import { ViewMode } from '@prisma/client'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { useSelector } from 'react-redux'
import { FC } from 'react'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { TaskCard } from './TaskCard'

interface Prop {
  task: TaskResponse
}

export const CardDragLayer: FC<Prop> = (props) => {
  const { view } = useSelector(selectTaskBoard)

  const currentTask = props.task

  const previewWidth = view === ViewMode.list ? 240 : 282 // Width of the CustomDragPreview

  if (view === ViewMode.list) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        columnGap={'16px'}
        sx={{
          bgcolor: '#fff',
          border: '1px solid #EFF1F4',
          padding: '12px 20px',
          width: `${previewWidth}px`,
          // transition: 'transform 0.1s ease',
        }}
      >
        <Typography
          variant="sm"
          fontWeight={400}
          sx={{
            color: (theme) => theme.color.gray[500],
            flexGrow: 0,
            minWidth: '75px',
            lineHeight: '21px',
          }}
        >
          {currentTask?.label}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          <Typography
            variant="sm"
            sx={{
              lineHeight: '21px',
              wordBreak: 'break-word',
              flexGrow: 1,
            }}
          >
            {currentTask?.title}
          </Typography>
        </Box>
      </Stack>
    )
  }
}
