'use client'

import { IAssigneeCombined } from '@/types/interfaces'
import localforage from 'localforage'

localforage.config({
  name: 'copilot-tasks-app',
  storeName: 'assignees',
})

export async function migrateAssignees(lookupKey: string) {
  const lKey = `assignees.${lookupKey}`
  const existing = localStorage.getItem(lKey)

  if (existing) {
    try {
      const parsed = JSON.parse(existing)
      await localforage.setItem(lKey, parsed)
      localStorage.removeItem(lKey)
    } catch (err) {
      console.error('Migration failed', err)
    }
  }
} //a utility function to migrate existing assignee data from localStorage to localForage

export async function getAssignees(lookupKey: string): Promise<IAssigneeCombined[]> {
  if (typeof window === 'undefined') return []

  try {
    if (!(await document.hasStorageAccess())) {
      console.info('Browswer has no storage access')
      await document.requestStorageAccess()
    }

    return (await localforage.getItem<IAssigneeCombined[]>(`assignees.${lookupKey}`)) ?? []
  } catch (error: unknown) {
    console.error(
      "Storage access not granted. Under Chrome's Settings > Privacy and Security, make sure 'Third-party cookies' is allowed.",
    )
    return []
  }
}

export async function setAssignees(lookupKey: string, value: any) {
  if (typeof window === 'undefined') return

  try {
    if (!(await document.hasStorageAccess())) {
      console.info('Browswer has no storage access')
      await document.requestStorageAccess()
    }

    return await localforage.setItem(`assignees.${lookupKey}`, value)
  } catch (error: unknown) {
    console.error(
      "Storage access not granted. Under Chrome's Settings > Privacy and Security, make sure 'Third-party cookies' is allowed.",
    )
  }
}
