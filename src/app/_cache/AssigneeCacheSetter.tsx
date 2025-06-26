'use client'

import { IAssigneeCombined } from '@/types/interfaces'

interface ClientAssigneeCacheSetterProps {
  lookupKey: string
  assignee: IAssigneeCombined[]
}

/**Simple localStorage cache for assignees so we can prevent long / frozen loading times for client
 * In the future we can move it to somewhere more robust like idb
 * @param lookupKey - either "assignee.internalUserId" or "assignee.clientId.companyId".
 * @param assignee - the assignee array to be cached
 * This accomodates the following situations
 * - User logs in and out in the same client portal domain with different client accounts
 * - (Client) User switches companies
 */
export const AssigneeCacheSetter = ({ lookupKey, assignee }: ClientAssigneeCacheSetterProps) => {
  localStorage.setItem(`assignees.${lookupKey}`, JSON.stringify(assignee))
  return <></>
}
