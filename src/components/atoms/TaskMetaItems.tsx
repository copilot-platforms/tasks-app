import { ArchiveBoxIcon, SubtaskIcon } from '@/icons'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { Stack, Typography } from '@mui/material'

export const TaskMetaItems = ({ task, lineHeight }: { task: TaskResponse; lineHeight: string }) => {
  return (
    <>
      {task.isArchived && (
        <Stack direction="row" alignItems={'center'} columnGap={'4px'}>
          <ArchiveBoxIcon />
          <Typography
            variant="bodyXs"
            sx={{ color: (theme) => theme.color.text.textSecondary, lineHeight: lineHeight ?? '21px' }}
          >
            Archived
          </Typography>
        </Stack>
      )}
      {task.subtaskCount > 0 && (
        <Stack direction="row" alignItems={'center'} columnGap={'4px'}>
          <Typography
            variant="bodySm"
            sx={{
              fontSize: '12px',
              color: (theme) => theme.color.text.textSecondary,
              lineHeight: lineHeight ?? '21px',
            }}
          >
            {task.subtaskCount}
          </Typography>
          <SubtaskIcon />
        </Stack>
      )}
    </>
  )
}
