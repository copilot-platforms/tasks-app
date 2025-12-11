'use client'

import { Clickable, Icons } from '@/hooks/app-bridge/types'
import { useActionsMenu } from '@/hooks/app-bridge/useActionsMenu'
import { useBreadcrumbs } from '@/hooks/app-bridge/useBreadcrumbs'
import { usePrimaryCta } from '@/hooks/app-bridge/usePrimaryCta'
import { setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import { setCreateTemplateFields, setTargetTemplateId } from '@/redux/features/templateSlice'
import store from '@/redux/store'
import { ITemplate } from '@/types/interfaces'
import { useCallback, useEffect, useState } from 'react'

interface ManageTemplateDetailsAppBridgeProps {
  portalUrl?: string
  template: ITemplate
  breadcrumbItems: {
    label: string
    href: string
  }[]
}

export const ManageTemplateDetailsAppBridge = ({
  portalUrl,
  template,
  breadcrumbItems,
}: ManageTemplateDetailsAppBridgeProps) => {
  const [awake, setAwake] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setAwake(true)
    }, 0)
  }, [])

  const handleDeleteTemplate = useCallback(() => {
    store.dispatch(setShowConfirmDeleteModal())
    store.dispatch(setTargetTemplateId(template.id))
    store.dispatch(setCreateTemplateFields({ targetField: 'taskName', value: template.title }))
    // "awaken" callback using one more render to avoid hydration issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awake])

  const items: Clickable[] = [
    {
      label: 'Delete template',
      icon: Icons.TRASH,
      onClick: handleDeleteTemplate,
    },
  ]
  usePrimaryCta(null, { portalUrl })
  useActionsMenu(items, { portalUrl })
  useBreadcrumbs(breadcrumbItems, { portalUrl })

  return <></>
}
