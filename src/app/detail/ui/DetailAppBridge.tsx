'use client'

import { Clickable, Icons } from '@/hooks/app-bridge/types'
import { useActionsMenu } from '@/hooks/app-bridge/useActionsMenu'
import { usePrimaryCta } from '@/hooks/app-bridge/usePrimaryCta'

interface DetailAppBridgeProps {
  handleToggleArchive: () => void
  portalUrl?: string
}

export const DetailAppBridge = ({ handleToggleArchive, portalUrl }: DetailAppBridgeProps) => {
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
      onClick: handleToggleArchive,
    },
  ]

  useActionsMenu(items, { portalUrl })

  return <></>
}
