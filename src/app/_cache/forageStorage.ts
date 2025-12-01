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

  const hasStorageAccess = await document.hasStorageAccess()
  if (!hasStorageAccess) {
    console.error('Storage access not granted')
    throw new Error(
      "Storage access not granted. Under Chrome's Settings > Privacy and Security, make sure 'Third-party cookies' is allowed.",
    )
  }

  await document.requestStorageAccess()
  return (await localforage.getItem<IAssigneeCombined[]>(`assignees.${lookupKey}`)) ?? []
}

export async function setAssignees(lookupKey: string, value: any) {
  if (typeof window === 'undefined') return

  const hasStorageAccess = await document.hasStorageAccess()
  console.log({ hasStorageAccess })

  if (!hasStorageAccess) {
    console.error('Storage access not granted')
    throw new Error(
      "Storage access not granted. Under Chrome's Settings > Privacy and Security, make sure 'Third-party cookies' is allowed.",
    )
  }

  return await localforage.setItem(`assignees.${lookupKey}`, value)
}
