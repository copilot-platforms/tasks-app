import { selectTaskBoard, setIsTasksLoading, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { ArchivedOptionsType } from '@/types/dto/viewSettings.dto'
import { fetcher } from '@/utils/fetcher'
import { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'

export const TaskDataFetcher = ({ onDataChange, token }: { onDataChange: (tasks: any[]) => void; token: string }) => {
  const { showArchived, showUnarchived } = useSelector(selectTaskBoard)

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

  const { data: allTasks, isLoading, mutate } = useSWR(token ? `/api/tasks/?${queryString}` : null, fetcher)

  useEffect(() => {
    store.dispatch(setIsTasksLoading(isLoading))
    if (!isLoading) {
      const tasks = allTasks?.tasks || []
      store.dispatch(setTasks(tasks))
      onDataChange(tasks)
    }
  }, [isLoading, allTasks, onDataChange])

  const updateTaskOnArchivedStateUpdate = useCallback(async () => {
    if (token) {
      try {
        await mutate()
      } catch (error) {
        console.error('Error updating tasks:', error)
      }
    }
  }, [token, mutate])

  useEffect(() => {
    updateTaskOnArchivedStateUpdate()
  }, [showArchived, showUnarchived, updateTaskOnArchivedStateUpdate])

  return null
}
