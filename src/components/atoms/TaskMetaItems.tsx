import { useSubtaskCount } from '@/hooks/useSubtaskCount'
import { ArchiveBoxIcon, SubtaskIcon } from '@/icons'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { Box, Stack, Typography, useMediaQuery } from '@mui/material'
import { useSelector } from 'react-redux'
import { CopilotTooltip } from './CopilotTooltip'

export const TaskMetaItems = ({ task, lineHeight }: { task: TaskResponse; lineHeight: string }) => {
  const subtaskCount = useSubtaskCount(task.id)
  const { showSubtasks } = useSelector(selectTaskBoard)

  return (
    <>
      {task.isArchived && (
        <Stack direction="row" alignItems={'center'} columnGap={'4px'}>
          <Box sx={{ marginTop: '-2px' }}>
            <ArchiveBoxIcon />
          </Box>
        </Stack>
      )}
      {subtaskCount > 0 && !showSubtasks && (
        <CopilotTooltip content={`${subtaskCount} task${subtaskCount === 1 ? '' : 's'}`}>
          <Stack direction="row" alignItems={'center'} columnGap={'4px'}>
            <Typography
              variant="bodySm"
              sx={{
                fontSize: '12px',
                color: (theme) => theme.color.text.textSecondary,
                lineHeight: lineHeight ?? '21px',
              }}
            >
              {subtaskCount}
            </Typography>
            <SubtaskIcon />
          </Stack>
        </CopilotTooltip>
      )}
    </>
  )
}
