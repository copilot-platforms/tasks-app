'use client'

import { setAssigneeList } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { useEffect } from 'react'

interface ClientAssigneeCacheGetterProps {
  lookupKey: string
}

export const AssigneeCacheGetter = ({ lookupKey }: ClientAssigneeCacheGetterProps) => {
  useEffect(() => {
    // The chance for a race condition here is very very low
    const assignee = localStorage.getItem(`assignees.${lookupKey}`)
    store.dispatch(setAssigneeList(assignee ? JSON.parse(assignee) : []))
  }, [lookupKey])

  return <></>
}
