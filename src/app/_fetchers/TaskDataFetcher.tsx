import { selectTaskBoard, setIsTasksLoading, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { ArchivedOptionsType } from '@/types/dto/viewSettings.dto'
import { fetcher } from '@/utils/fetcher'
import { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'

export const TaskDataFetcher = ({ token }: { token: string }) => {
  const { showArchived, showUnarchived, tasks } = useSelector(selectTaskBoard)
  const lastRequestIdRef = useRef(0)

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
    if (token) {
      const currentRequestId = ++lastRequestIdRef.current

      try {
        store.dispatch(setIsTasksLoading(true))
        const result = await mutate()
        //updating the recent requests only
        if (currentRequestId === lastRequestIdRef.current) {
          store.dispatch(setTasks(result.tasks))
          store.dispatch(setIsTasksLoading(false))
        }
      } catch (error) {
        if (currentRequestId === lastRequestIdRef.current) {
          console.error('Error updating tasks:', error)
          store.dispatch(setIsTasksLoading(false))
        }
      }
    }
  }, [token, mutate])

  useEffect(() => {
    updateTaskOnArchivedStateUpdate()
  }, [showArchived, showUnarchived, updateTaskOnArchivedStateUpdate])

  return null
}
