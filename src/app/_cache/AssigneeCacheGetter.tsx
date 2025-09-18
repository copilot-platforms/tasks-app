'use client'

import { setAssigneeList } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { useEffect } from 'react'
import { getAssignees, migrateAssignees } from '@/app/_cache/forageStorage'

interface ClientAssigneeCacheGetterProps {
  lookupKey: string
}

export const AssigneeCacheGetter = ({ lookupKey }: ClientAssigneeCacheGetterProps) => {
  useEffect(() => {
    const run = async () => {
      await migrateAssignees(lookupKey) //migrate from localStorage to localForage if required. Remember to remove this after a while.
      const assignee = await getAssignees(lookupKey)
      store.dispatch(setAssigneeList(assignee))
    }
    run()
  }, [lookupKey])

  return <></>
}
