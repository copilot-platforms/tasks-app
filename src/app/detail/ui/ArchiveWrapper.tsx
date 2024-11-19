'use client'

import { ArchiveBtn } from '@/components/buttons/ArchiveBtn'
import { useEffect, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { fetcher } from '@/utils/fetcher'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { Skeleton } from '@mui/material'
import store from '@/redux/store'
import { setTask } from '@/redux/features/taskDetailsSlice'

export const ArchiveWrapper = ({ taskId }: { taskId: string }) => {
  const { token } = useSelector(selectTaskBoard)
  const { mutate } = useSWRConfig()
  const cacheKey = `/api/tasks/${taskId}?token=${token}`
  const { data, error } = useSWR(cacheKey, fetcher)
  const [isArchived, setIsArchived] = useState<boolean | undefined>(undefined)

  // Set the initial state when `data` becomes available
  useEffect(() => {
    if (data?.task) {
      setIsArchived(data.task.isArchived)
      store.dispatch(setTask(data.task))
    }
  }, [data])

  const handleToggleArchive = async () => {
    if (isArchived === undefined) return // Prevent toggling if state isn't initialized yet

    const newIsArchived = !isArchived
    const optimisticTask = { ...data.task, isArchived: newIsArchived }

    setIsArchived(newIsArchived) // Optimistically update local state

    try {
      await mutate(
        cacheKey,
        async () => {
          // Call the actual API to toggle isArchived
          await fetch(`/api/tasks/${taskId}?token=${token}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isArchived: newIsArchived }),
          })

          // Re-fetch updated data
          return await fetcher(cacheKey)
        },
        {
          optimisticData: { task: optimisticTask }, // Update UI immediately
          rollbackOnError: true, // Revert on error
        },
      )
    } catch (error) {
      console.error('Failed to toggle archive status:', error)
      setIsArchived(!newIsArchived) // Revert local state on error
    }
  }

  // Handle loading and error states
  if (!data || error || isArchived === undefined) return <Skeleton variant="rectangular" width="60px" height="16px" />

  return <ArchiveBtn isArchived={isArchived} handleClick={handleToggleArchive} />
}
