'use client'

import { Clickable, Icons } from '@/hooks/app-bridge/types'
import { useActionsMenu } from '@/hooks/app-bridge/useActionsMenu'
import { usePrimaryCta } from '@/hooks/app-bridge/usePrimaryCta'
import { setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'

interface DetailAppBridgeProps {
  handleToggleArchive: () => void
  portalUrl?: string
}

export const DetailAppBridge = ({ handleToggleArchive, portalUrl }: DetailAppBridgeProps) => {
  const handleDelete = () => store.dispatch(setShowConfirmDeleteModal())

  usePrimaryCta(null, { portalUrl })

  const items: Clickable[] = [
    {
      label: 'Archive task',
      icon: Icons.ARCHIVE,
      onClick: handleToggleArchive,
    },
    {
      label: 'Delete task',
      icon: Icons.TRASH,
      onClick: handleDelete,
    },
  ]

  useActionsMenu(items, { portalUrl })

  return <></>
}
