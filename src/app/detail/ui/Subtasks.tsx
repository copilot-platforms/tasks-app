'use client'

import { handleCreate } from '@/app/(home)/actions'
import { UserRole } from '@/app/api/core/types/user'
import { NewTaskCard } from '@/app/detail/ui/NewTaskCard'
import { TaskCardList } from '@/app/detail/ui/TaskCardList'
import { AddBtn } from '@/components/buttons/AddBtn'
import { GhostBtn } from '@/components/buttons/GhostBtn'
import { GrayAddMediumIcon } from '@/icons'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { CreateTaskRequest, TaskResponse } from '@/types/dto/tasks.dto'
import { fetcher } from '@/utils/fetcher'
import { generateRandomString } from '@/utils/generateRandomString'
import { checkOptimisticStableId } from '@/utils/optimisticCommentUtils'
import { getTempTask } from '@/utils/optimisticTaskUtils'
import { sortTaskByDescendingOrder } from '@/utils/sortTask'
import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import useSWR, { useSWRConfig } from 'swr'

interface OptimisticUpdate {
  tempId: string
  serverId?: string
  timestamp: number
}

export const Subtasks = ({
  task_id,
  token,
  userType,
  canCreateSubtasks,
}: {
  task_id: string
  token: string
  userType: UserRole
  canCreateSubtasks: boolean
}) => {
  const [openTaskForm, setOpenTaskForm] = useState(false)
  const { workflowStates, assignee, activeTask } = useSelector(selectTaskBoard)
  const { tokenPayload } = useSelector(selectAuthDetails)
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate[]>([]) //might need this server-temp id maps in the future.

  const handleFormCancel = () => {
    setOpenTaskForm(false)
  }
  const handleFormOpen = () => {
    setOpenTaskForm(!openTaskForm)
  }

  const mode = tokenPayload?.companyId ? UserRole.Client : UserRole.IU

  const cacheKey = `/api/tasks/?token=${token}&showArchived=1&showUnarchived=1&parentId=${task_id}`

  const { data: subTasks } = useSWR(cacheKey, fetcher, { refreshInterval: 0 })

  const { mutate } = useSWRConfig()

  useEffect(() => {
    const taskListLength = subTasks?.tasks?.length

    if (!activeTask || typeof taskListLength !== 'number') return

    if (activeTask.subtaskCount !== taskListLength) {
      mutate(cacheKey)
    }
  }, [activeTask?.subtaskCount, activeTask?.isArchived, subTasks?.tasks?.length])

  const handleSubTaskCreation = (payload: CreateTaskRequest) => {
    const tempId = generateRandomString('temp-task')
    setOptimisticUpdates((prev) => [
      ...prev,
      {
        tempId,
        timestamp: Date.now(),
      },
    ])
    const tempSubtask: TaskResponse = getTempTask(
      tempId,
      payload,
      workflowStates,
      assignee,
      tokenPayload?.workspaceId ?? '',
      tokenPayload?.internalUserId ?? '',
      task_id,
    )
    const optimisticData = subTasks?.tasks ? sortTaskByDescendingOrder([...subTasks.tasks, tempSubtask]) : [tempSubtask]
    try {
      mutate(
        cacheKey,
        async () => {
          const subTask = await handleCreate(token, payload)
          setOptimisticUpdates((prev) =>
            prev.map((update) => (update.tempId === tempId ? { ...update, serverId: subTask.id } : update)),
          )
          return await fetcher(cacheKey)
        },
        {
          optimisticData: { tasks: optimisticData },
          rollbackOnError: true,
          revalidate: true,
        },
      )
    } catch (error) {
      console.error('Failed to create subtask:', error)
      setOptimisticUpdates((prev) => prev.filter((update) => update.tempId !== tempId))
    }
  }

  const handleSubTaskUpdate = async (taskId: string, changes: Partial<TaskResponse>, updater: () => Promise<void>) => {
    if (!subTasks?.tasks) return
    const updatedTasks = subTasks.tasks.map((task: TaskResponse) => (task.id === taskId ? { ...task, ...changes } : task))

    try {
      await mutate(
        cacheKey,
        async () => {
          await updater()
          return await fetcher(cacheKey)
        },
        {
          optimisticData: { tasks: updatedTasks },
          rollbackOnError: true,
          revalidate: true,
        },
      )
    } catch (error) {
      console.error('Failed to update subtask:', error)
    }
  }

  return (
    <Stack
      direction="column"
      rowGap={'8px'}
      width="100%"
      sx={{ padding: !canCreateSubtasks && subTasks?.tasks?.length == 0 ? '0px' : '24px 0px 0px' }}
    >
      {canCreateSubtasks && (
        <>
          {subTasks && subTasks?.tasks?.length > 0 ? (
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
          ) : subTasks ? (
            // If subtasks has been loaded but task length is empty, show button
            <GhostBtn buttonText="Create subtask" handleClick={handleFormOpen} startIcon={<GrayAddMediumIcon />} />
          ) : (
            // If subtasks list hasn't been rendered
            <></>
          )}
        </>
      )}
      {!canCreateSubtasks && subTasks?.tasks?.length > 0 && (
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
        </Stack>
      )}

      {openTaskForm && <NewTaskCard handleClose={handleFormCancel} handleSubTaskCreation={handleSubTaskCreation} />}
      <Box>
        {subTasks?.tasks?.map((item: TaskResponse, index: number) => {
          const isTempId = item.id.includes('temp')

          return (
            <TaskCardList
              isTemp={isTempId}
              key={checkOptimisticStableId(item, optimisticUpdates)}
              task={item}
              variant="subtask"
              mode={mode}
              handleUpdate={handleSubTaskUpdate}
            />
          )
        })}
      </Box>
    </Stack>
  )
}
