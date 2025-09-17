'use client'

import { IAssigneeCombined } from '@/types/interfaces'
import { useEffect } from 'react'
import { setAssignees } from '@/app/_cache/forageStorage'

interface ClientAssigneeCacheSetterProps {
  lookupKey: string
  assignee: IAssigneeCombined[]
}

/**Simple localForage cache for assignees so we can prevent long / frozen loading times for client
 * In the future we can move it to somewhere more robust like idb
 * @param lookupKey - either "assignee.internalUserId" or "assignee.clientId.companyId".
 * @param assignee - the assignee array to be cached
 * This accomodates the following situations
 * - User logs in and out in the same client portal domain with different client accounts
 * - (Client) User switches companies
 */
export const AssigneeCacheSetter = ({ lookupKey, assignee }: ClientAssigneeCacheSetterProps) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAssignees(lookupKey, assignee)
    }
  }, [lookupKey, assignee])

  return null
}
