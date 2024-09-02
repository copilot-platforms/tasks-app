import { Box, Stack, Typography } from '@mui/material'
import { ViewMode } from '@prisma/client'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { useSelector } from 'react-redux'
import { XYCoord } from 'react-dnd'
import { FC } from 'react'
import { TaskResponse } from '@/types/dto/tasks.dto'

const getItemStyles = (currentOffset: XYCoord | null, previewWidth: number) => {
  if (!currentOffset) {
    return {
      display: 'none',
    }
  }

  const { x, y } = currentOffset
  // Adjust the preview position to center it under the cursor
  const adjustedX = x - (previewWidth - 20) // Adjust based on desired offset from the right corner
  const adjustedY = y - 20 // Adjust the Y offset if needed

  const transform = `translate(${adjustedX}px, ${adjustedY}px)`

  return {
    transform,
    WebkitTransform: transform,
  }
}

interface Prop {
  currentOffset?: XYCoord | null
  item?: { task: TaskResponse }
}

export const ClientCardDragLayer: FC<Prop> = (props) => {
  const { item, currentOffset } = props

  const { view } = useSelector(selectTaskBoard)

  const currentTask = item?.task

  const previewWidth = 240 // Width of the CustomDragPreview

  if (view === ViewMode.board || !currentTask || !item || !currentOffset) {
    return null
  }

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
        transition: 'transform 0.1s ease',
        ...getItemStyles(currentOffset, previewWidth),
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
