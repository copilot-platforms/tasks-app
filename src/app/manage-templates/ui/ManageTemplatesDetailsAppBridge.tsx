'use client'

import { Clickable, Icons } from '@/hooks/app-bridge/types'
import { useActionsMenu } from '@/hooks/app-bridge/useActionsMenu'
import { useBreadcrumbs } from '@/hooks/app-bridge/useBreadcrumbs'
import { usePrimaryCta } from '@/hooks/app-bridge/usePrimaryCta'
import { setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import { setCreateTemplateFields, setTargetTemplateId } from '@/redux/features/templateSlice'
import store from '@/redux/store'
import { ITemplate } from '@/types/interfaces'

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
  const handleDeleteTemplate = () => {
    store.dispatch(setShowConfirmDeleteModal())
    store.dispatch(setTargetTemplateId(template.id))
    store.dispatch(setCreateTemplateFields({ targetField: 'taskName', value: template.title }))
  }
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
