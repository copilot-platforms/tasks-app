import { ActionsMenuPayload, Clickable, Configurable } from '@/hooks/app-bridge/types'
import { ensureHttps } from '@/utils/https'
import { useEffect, useMemo } from 'react'

const getActionMenuItemId = (idx: number) => `header.actionsMenu.${idx}`

export function useActionsMenu(actions: Clickable[], config?: Configurable) {
  const callbackRefs = useMemo(() => {
    return actions.reduce<Record<string, () => void>>((acc, { onClick }, idx) => {
      if (onClick) acc[getActionMenuItemId(idx)] = onClick
      return acc
    }, {})
  }, [actions])

  useEffect(() => {
    const payload: ActionsMenuPayload = {
      type: 'header.actionsMenu',
      items: actions.map(({ label, onClick, icon }, idx) => ({
        onClick: onClick ? getActionMenuItemId(idx) : '',
        label,
        icon,
      })),
    }

    window.parent.postMessage(payload, 'https://dashboard.copilot.com')
    if (config?.portalUrl) {
      window.parent.postMessage(payload, ensureHttps(config.portalUrl))
    }

    const handleMessage = (event: MessageEvent) => {
      if (
        event.data.type === 'header.actionsMenu.onClick' &&
        typeof event.data.id === 'string' &&
        callbackRefs[event.data.id]
      ) {
        callbackRefs[event.data.id]()
      }
    }

    addEventListener('message', handleMessage)

    return () => {
      removeEventListener('message', handleMessage)
    }
  }, [actions, callbackRefs, config?.portalUrl])

  useEffect(() => {
    const handleUnload = () => {
      window.parent.postMessage({ type: 'header.actionsMenu', items: [] }, 'https://dashboard.copilot.com')
    }
    addEventListener('beforeunload', handleUnload)
    return () => {
      removeEventListener('beforeunload', handleUnload)
    }
  }, [])
}
