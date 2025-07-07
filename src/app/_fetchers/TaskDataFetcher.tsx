import { selectTaskBoard, setIsTasksLoading, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { ArchivedOptionsType } from '@/types/dto/viewSettings.dto'
import { PropsWithToken } from '@/types/interfaces'
import { fetcher } from '@/utils/fetcher'
import { useCallback, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'

export const TaskDataFetcher = ({ token }: PropsWithToken) => {
  const { showArchived, showUnarchived } = useSelector(selectTaskBoard)

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

  const { data, isLoading, mutate } = useSWR(token ? `/api/tasks/?${queryString}&testId=123` : null, fetcher)

  const updateTaskOnArchivedStateUpdate = useCallback(async () => {
    const currentArchivedOptions = latestArchivedOptions.current // Use latest values from ref
    const currentQueryString = buildQueryString(token, currentArchivedOptions)
    if (token) {
      try {
        store.dispatch(setIsTasksLoading(true))
        await mutate().then((data) => {
          if (currentQueryString === buildQueryString(token, latestArchivedOptions.current)) {
            if (data) {
              store.dispatch(setTasks(data.tasks))
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
