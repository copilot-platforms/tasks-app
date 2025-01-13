'use client'

import { Icons } from '@/hooks/app-bridge/types'
import { useActionsMenu } from '@/hooks/app-bridge/useActionsMenu'
import { useBreadcrumbs } from '@/hooks/app-bridge/useBreadcrumbs'
import { usePrimaryCta } from '@/hooks/app-bridge/usePrimaryCta'
import { useSecondaryCta } from '@/hooks/app-bridge/useSecondaryCta'
import { setShowModal } from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { UserRole } from '@api/core/types/user'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

interface TaskBoardAppBridgeProps {
  token: string
  role: UserRole
  portalUrl?: string
}

export const TaskBoardAppBridge = ({ token, role, portalUrl }: TaskBoardAppBridgeProps) => {
  const router = useRouter()

  const [awake, setAwake] = useState(false)
  setTimeout(() => {
    setAwake(true)
  }, 0)

  const handleTaskCreate = useCallback(() => {
    store.dispatch(setShowModal())
  }, [awake])

  const handleManageTemplatesClick = () => {
    router.push(`/manage-templates?token=${token}`)
  }

  usePrimaryCta(
    {
      label: 'Create task',
      icon: Icons.PLUS,
      onClick: handleTaskCreate,
    },
    { portalUrl },
  )

  // Unset "Unarchive" button from tasks details if redirected to board from an archived task
  useSecondaryCta(null, { portalUrl })

  useActionsMenu(
    [
      {
        label: 'Manage templates',
        icon: Icons.ARCHIVE,
        onClick: handleManageTemplatesClick,
      },
    ],
    { portalUrl },
  )
  useBreadcrumbs([], { portalUrl })

  return <></>
}
