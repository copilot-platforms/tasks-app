import { UserRole } from '@/app/api/core/types/user'
import { TaskCard } from '@/components/cards/TaskCard'
import { ArchiveBoxIcon } from '@/icons'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { Box, Stack, Typography } from '@mui/material'
import { ViewMode } from '@prisma/client'
import { FC } from 'react'
import { XYCoord } from 'react-dnd'
import { useSelector } from 'react-redux'

const getItemStyles = (currentOffset: XYCoord | null, previewWidth: number, viewMode: ViewMode) => {
  if (!currentOffset) {
    return {
      display: 'none',
    }
  }

  const { x, y } = currentOffset
  // Adjust the preview position to center it under the cursor
  const adjustedX = viewMode === ViewMode.list ? x - (previewWidth - 20) : x - previewWidth / 1.5 // Adjust based on desired offset from the right corner
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
  mode: UserRole
}

export const CardDragLayer: FC<Prop> = (props) => {
  const { item, currentOffset, mode } = props

  const { view, token } = useSelector(selectTaskBoard)

  const currentTask = item?.task

  const previewWidth = view === ViewMode.list ? 240 : 282 // Width of the CustomDragPreview

  if (!currentTask || !item || !currentOffset) {
    return null
  }

  if (view === ViewMode.board) {
    return (
      <Stack
        sx={{
          padding: '12px 20px',
          width: `${previewWidth}px`,
          transition: 'transform 0.1s ease',
          ...getItemStyles(currentOffset, previewWidth, ViewMode.board),
        }}
      >
        <TaskCard
          mode={mode}
          task={currentTask}
          key={currentTask.id}
          href={{ pathname: `/detail/${currentTask.id}/iu`, query: { token } }}
        />
      </Stack>
    )
  }

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
          transition: 'transform 0.1s ease',
          ...getItemStyles(currentOffset, previewWidth, ViewMode.list),
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
        <Box sx={{ display: 'flex', gap: '8px' }}>
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
          {currentTask.isArchived && (
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '100%' }}>
              <ArchiveBoxIcon />
            </Box>
          )}
        </Box>
      </Stack>
    )
  }
}
