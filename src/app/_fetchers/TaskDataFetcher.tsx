import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard, setIsTasksLoading, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { InternalUsersSchema } from '@/types/common'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { ArchivedOptionsType } from '@/types/dto/viewSettings.dto'
import { fetcher } from '@/utils/fetcher'
import { AssigneeType } from '@prisma/client'
import { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'

export const TaskDataFetcher = ({ token }: { token: string }) => {
  const { showArchived, showUnarchived, accessibleTasks, assignee } = useSelector(selectTaskBoard)
  const { tokenPayload } = useSelector(selectAuthDetails)

  const userId = tokenPayload?.internalUserId || tokenPayload?.clientId
  const userRole = tokenPayload?.internalUserId
    ? AssigneeType.internalUser
    : tokenPayload?.clientId
      ? AssigneeType.client
      : undefined

  const latestArchivedOptions = useRef({ showArchived, showUnarchived })

  useEffect(() => {
    latestArchivedOptions.current = { showArchived, showUnarchived }
  }, [showArchived, showUnarchived])

  const buildQueryString = useCallback((token: string, archivedOptions?: ArchivedOptionsType) => {
    const queryParams = new URLSearchParams({ token })
    if (archivedOptions?.showArchived !== undefined) {
      queryParams.append('showArchived', archivedOptions.showArchived.toString())
    }
    if (archivedOptions?.showUnarchived !== undefined) {
      queryParams.append('showUnarchived', archivedOptions.showUnarchived.toString())
    }
    return queryParams.toString()
  }, [])

  const queryString = token ? buildQueryString(token, { showArchived, showUnarchived }) : ''

  const { data, isLoading, mutate } = useSWR(token ? `/api/tasks/?${queryString}` : null, fetcher)

  const updateTaskOnArchivedStateUpdate = useCallback(async () => {
    const currentArchivedOptions = latestArchivedOptions.current // Use latest values from ref
    const currentQueryString = buildQueryString(token, currentArchivedOptions)
    if (token) {
      try {
        store.dispatch(setIsTasksLoading(true))
        await mutate().then((data) => {
          if (currentQueryString === buildQueryString(token, latestArchivedOptions.current)) {
            if (data) {
              const user = assignee.find((el) => el.id === userId)
              if (user && userRole === AssigneeType.internalUser && !InternalUsersSchema.parse(user).isClientAccessLimited) {
                store.dispatch(setTasks(data.tasks))
              } else {
                const allTasks = data.tasks.map((task: TaskResponse) => {
                  return {
                    ...task,
                    subtaskCount: accessibleTasks.filter((subTask) => task.id === subTask?.parentId).length,
                  }
                })

                store.dispatch(setTasks(allTasks))
              }
            }
          }
        }) // preventing extra rerendering
      } catch (error) {
        console.error('Error updating tasks:', error)
      } finally {
        store.dispatch(setIsTasksLoading(false))
      }
    }
  }, [token, mutate])

  useEffect(() => {
    updateTaskOnArchivedStateUpdate()
  }, [showArchived, showUnarchived, updateTaskOnArchivedStateUpdate])

  return null
}
