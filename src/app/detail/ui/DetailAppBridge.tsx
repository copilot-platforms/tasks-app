'use client'

import { Clickable, Icons } from '@/hooks/app-bridge/types'
import { useActionsMenu } from '@/hooks/app-bridge/useActionsMenu'
import { useBreadcrumbs } from '@/hooks/app-bridge/useBreadcrumbs'
import { usePrimaryCta } from '@/hooks/app-bridge/usePrimaryCta'
import { useSecondaryCta } from '@/hooks/app-bridge/useSecondaryCta'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'
import { useSelector } from 'react-redux'

interface DetailAppBridgeProps {
  isArchived: boolean
  handleToggleArchive: () => void
  portalUrl?: string
}

export const DetailAppBridge = ({ isArchived, handleToggleArchive, portalUrl }: DetailAppBridgeProps) => {
  const handleDelete = () => store.dispatch(setShowConfirmDeleteModal())
  const { activeTask } = useSelector(selectTaskBoard)

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

  useBreadcrumbs(
    [
      {
        label: activeTask?.title ?? '',
      },
    ],
    { portalUrl },
  )

  const items: Clickable[] = [
    {
      label: 'Delete task',
      icon: Icons.TRASH,
      onClick: handleDelete,
      color: 'red',
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
