'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { NewTaskCard } from '@/app/detail/ui/NewTaskCard'
import { GhostBtn } from '@/components/buttons/GhostBtn'
import { GrayAddMediumIcon } from '@/icons'
import { TaskCardList } from '@/app/detail/ui/TaskCardList'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import useSWR, { useSWRConfig } from 'swr'
import { fetcher } from '@/utils/fetcher'
import { CreateTaskRequest, TaskResponse } from '@/types/dto/tasks.dto'
import { AddBtn } from '@/components/buttons/AddBtn'
import { CustomLink } from '@/hoc/CustomLink'
import { getCardHref } from '@/utils/getCardHref'
import { UserRole } from '@/app/api/core/types/user'
import { generateRandomString } from '@/utils/generateRandomString'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { handleCreate } from '@/app/actions'
import { checkOptimisticStableId } from '@/utils/optimisticCommentUtils'
import { sortTaskByDescendingOrder } from '@/utils/sortTask'
import { getTempTask } from '@/utils/optimisticTaskUtils'

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

  const [currentSubtasksCount, setCurrentSubtasksCount] = useState(activeTask?.subtaskCount)

  const handleFormCancel = () => {
    setOpenTaskForm(false)
  }
  const handleFormOpen = () => {
    setOpenTaskForm(!openTaskForm)
  }

  const cacheKey = `/api/tasks/?token=${token}&showArchived=1&showUnarchived=1&parentId=${task_id}`
  const { data: subTasks, mutate: mutateList } = useSWR(cacheKey, fetcher, { refreshInterval: 0 })

  const { mutate } = useSWRConfig()

  useEffect(() => {
    const refetchSubtasks = async () => {
      await mutate(cacheKey)
      setCurrentSubtasksCount(activeTask?.subtaskCount)
    }
    if (currentSubtasksCount !== activeTask?.subtaskCount) {
      refetchSubtasks()
    }
  }, [activeTask?.subtaskCount])

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
          ) : (
            <GhostBtn buttonText="Create subtask" handleClick={handleFormOpen} startIcon={<GrayAddMediumIcon />} />
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
          if (isTempId) {
            return (
              <div
                style={{
                  cursor: 'pointer',
                }}
                key={checkOptimisticStableId(item, optimisticUpdates)}
              >
                <TaskCardList task={item} variant="subtask" />
              </div>
            )
          }

          return (
            <CustomLink
              key={checkOptimisticStableId(item, optimisticUpdates)}
              href={{ pathname: getCardHref(item, userType), query: { token } }}
            >
              <TaskCardList task={item} variant="subtask" />
            </CustomLink>
          )
        })}
      </Box>
    </Stack>
  )
}
