'use client'

import { Icons } from '@/hooks/app-bridge/types'
import { useActionsMenu } from '@/hooks/app-bridge/useActionsMenu'
import { usePrimaryCta } from '@/hooks/app-bridge/usePrimaryCta'
import { UserRole } from '@api/core/types/user'

interface DetailAppBridgeProps {
  role: UserRole
  portalUrl?: string
}

export const DetailAppBridge = ({ role, portalUrl }: DetailAppBridgeProps) => {
  usePrimaryCta(null, { portalUrl })
  useActionsMenu(
    [
      {
        label: 'Archive task',
        icon: Icons.ARCHIVE,
        onClick: () => {},
      },
      {
        label: 'Delete task',
        icon: Icons.TRASH,
        onClick: () => {},
      },
    ],
    { portalUrl },
  )

  return <></>
}
