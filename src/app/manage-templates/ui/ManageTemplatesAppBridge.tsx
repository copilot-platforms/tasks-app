'use client'

import { Icons } from '@/hooks/app-bridge/types'
import { useActionsMenu } from '@/hooks/app-bridge/useActionsMenu'
import { useBreadcrumbs } from '@/hooks/app-bridge/useBreadcrumbs'
import { usePrimaryCta } from '@/hooks/app-bridge/usePrimaryCta'
import { setShowTemplateModal } from '@/redux/features/templateSlice'
import store from '@/redux/store'
import { TargetMethod } from '@/types/interfaces'
import { UserRole } from '@api/core/types/user'
import { useRouter } from 'next/navigation'

interface TaskBoardAppBridgeProps {
  token: string
  role: UserRole
  portalUrl?: string
}

export const ManageTemplatesAppBridge = ({ token, role, portalUrl }: TaskBoardAppBridgeProps) => {
  const router = useRouter()
  const handleTemplateCreate = () => {
    store.dispatch(setShowTemplateModal({ targetMethod: TargetMethod.POST }))
  }

  const handleBreadcrumbsClick = () => {
    router.push(`/?token=${token}`)
  }

  usePrimaryCta(
    {
      label: 'Create template',
      icon: Icons.PLUS,
      onClick: handleTemplateCreate,
    },
    { portalUrl },
  )
  useActionsMenu([], { portalUrl })
  useBreadcrumbs(
    [
      {
        label: 'Manage templates',
        onClick: handleBreadcrumbsClick,
      },
    ],
    { portalUrl },
  )
  return <></>
}
