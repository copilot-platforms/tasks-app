'use client'

import { Clickable, Icons } from '@/hooks/app-bridge/types'
import { useActionsMenu } from '@/hooks/app-bridge/useActionsMenu'
import { usePrimaryCta } from '@/hooks/app-bridge/usePrimaryCta'
import { useSecondaryCta } from '@/hooks/app-bridge/useSecondaryCta'
import { setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'

interface DetailAppBridgeProps {
  isArchived: boolean
  handleToggleArchive: () => void
  portalUrl?: string
}

export const DetailAppBridge = ({ isArchived, handleToggleArchive, portalUrl }: DetailAppBridgeProps) => {
  const handleDelete = () => store.dispatch(setShowConfirmDeleteModal())

  usePrimaryCta(null, { portalUrl })
  useSecondaryCta(
    isArchived
      ? {
          label: 'Unarchive',
          icon: Icons.ARCHIVE,
          onClick: handleToggleArchive,
        }
      : null,
    { portalUrl },
  )

  const items: Clickable[] = [
    {
      label: 'Delete task',
      icon: Icons.TRASH,
      onClick: handleDelete,
    },
  ]
  if (!isArchived) {
    items.unshift({
      label: 'Archive task',
      icon: Icons.ARCHIVE,
      onClick: handleToggleArchive,
    })
  }

  useActionsMenu(items, { portalUrl })

  return <></>
}
