import { setActiveTask } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { PropsWithToken } from '@/types/interfaces'
import { fetcher } from '@/utils/fetcher'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'

interface OneTaskDataFetcherProps extends PropsWithToken {
  task_id: string
}

export const OneTaskDataFetcher = ({ token, task_id }: OneTaskDataFetcherProps & PropsWithToken) => {
  const buildQueryString = (token: string) => {
    const queryParams = new URLSearchParams({ token })

    return queryParams.toString()
  }

  const queryString = token ? buildQueryString(token) : null

  const { data } = useSWR(queryString ? `/api/tasks/${task_id}?${queryString}` : null, fetcher)

  useEffect(() => {
    if (data?.task) {
      store.dispatch(setActiveTask(data.task))
    }
  }, [data])

  return null
}
