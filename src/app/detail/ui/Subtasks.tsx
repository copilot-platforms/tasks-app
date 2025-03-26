'use client'

import { useOptimistic, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'

import { NewTaskCard } from '@/app/detail/ui/NewTaskCard'
import { GhostBtn } from '@/components/buttons/GhostBtn'
import { AddLargeIcon, GrayAddIcon, GrayAddMediumIcon } from '@/icons'
import { TaskCardList } from '@/app/detail/ui/TaskCardList'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import useSWR from 'swr'
import { fetcher } from '@/utils/fetcher'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { IconBtn } from '@/components/buttons/IconBtn'
import { AddBtn } from '@/components/buttons/AddBtn'
import { CustomLink } from '@/hoc/CustomLink'
import { getCardHref } from '@/utils/getCardHref'
import { UserRole } from '@/app/api/core/types/user'
import { SubTasksStatus } from '@/types/common'

export const Subtasks = ({ task_id, token, userType }: { task_id: string; token: string; userType: UserRole }) => {
  const [openTaskForm, setOpenTaskForm] = useState(false)

  const handleFormCancel = () => {
    setOpenTaskForm(false)
  }
  const handleFormOpen = () => {
    setOpenTaskForm(!openTaskForm)
  }

  const cacheKey = `/api/tasks/?token=${token}&showArchived=1&showUnarchived=1&parentId=${task_id}`
  const { data: subTasks, mutate: mutateList } = useSWR(cacheKey, fetcher, { refreshInterval: 0 })

  const mutateSubTasks = () => {
    mutateList()
  }

  return (
    <Stack direction="column" rowGap={'8px'} width="100%" sx={{ padding: '24px 0px 0px' }}>
      {subTasks && subTasks?.tasks.length > 0 ? (
        <Stack
          direction="row"
          sx={{
            display: 'flex',
            height: '32px',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'stretch',
          }}
        >
          <Typography variant="lg">Subtasks</Typography>

          <AddBtn handleClick={handleFormOpen} />
        </Stack>
      ) : (
        <GhostBtn buttonText="Create subtask" handleClick={handleFormOpen} startIcon={<GrayAddMediumIcon />} />
      )}

      {openTaskForm && <NewTaskCard handleClose={handleFormCancel} mutateSubTasks={mutateSubTasks} />}
      <Box>
        {subTasks?.tasks?.map((item: TaskResponse, index: number) => (
          <CustomLink key={item.id} href={{ pathname: getCardHref(item, userType), query: { token } }}>
            <TaskCardList task={item} />
          </CustomLink>
        ))}
      </Box>
    </Stack>
  )
}
