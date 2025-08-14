import { selectTaskBoard, setIsTasksLoading, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { DisplayOptions } from '@/types/dto/viewSettings.dto'
import { PropsWithToken } from '@/types/interfaces'
import { fetcher } from '@/utils/fetcher'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import useSWR from 'swr'

export const TaskDataFetcher = ({ token }: PropsWithToken) => {
  const { showArchived, showUnarchived, showSubtasks, tasks } = useSelector(selectTaskBoard)

  const buildQueryString = (token: string, displayOptions?: DisplayOptions) => {
    const queryParams = new URLSearchParams({ token })
    if (displayOptions?.showArchived !== undefined) {
      queryParams.append('showArchived', displayOptions.showArchived.toString())
    }
    if (displayOptions?.showUnarchived !== undefined) {
      queryParams.append('showUnarchived', displayOptions.showUnarchived.toString())
    }

    // NOTE: We don't need to send showSubtasks as a param to `getTasks` since we
    // are currently implementing showSubtasks in UI only. Uncomment and proceed with handling
    // showSubtasks in GET /api/tasks if we handle from the backend

    // if (displayOptions?.showSubtasks !== undefined) {
    //   queryParams.append('showSubtasks', displayOptions.showSubtasks.toString())
    // }

    return queryParams.toString()
  }

  const queryString = token ? buildQueryString(token, { showArchived, showUnarchived, showSubtasks }) : null

  const { data, isLoading } = useSWR(queryString ? `/api/tasks/?${queryString}` : null, fetcher, {
    fallbackData: { tasks },
    revalidateOnMount: false,
    revalidateOnFocus: false,
    refreshInterval: 0,
  })

  useEffect(() => {
    store.dispatch(setIsTasksLoading(isLoading))
  }, [isLoading])

  useEffect(() => {
    if (data?.tasks) {
      store.dispatch(setTasks(data.tasks))
    }
  }, [data])

  return null
}
