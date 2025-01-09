import { Clickable, Configurable, PrimaryCtaPayload } from '@/hooks/app-bridge/types'
import { useEffect } from 'react'

export const usePrimaryCta = (primaryCta: Clickable | null, config?: Configurable) => {
  useEffect(() => {
    const payload: PrimaryCtaPayload | Pick<PrimaryCtaPayload, 'type'> = !primaryCta
      ? { type: 'header.primaryCta' }
      : {
          icon: primaryCta.icon,
          label: primaryCta.label,
          onClick: 'header.primaryCta.onClick',
          type: 'header.primaryCta',
        }

    window.parent.postMessage(payload, 'https://dashboard.copilot.com')
    if (config?.portalUrl) {
      window.parent.postMessage(payload, ensureHttps(config.portalUrl))
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'header.primaryCta.onClick' && typeof event.data.id === 'string' && primaryCta?.onClick) {
        primaryCta.onClick()
      }
    }

    addEventListener('message', handleMessage)

    return () => {
      removeEventListener('message', handleMessage)
    }
  }, [primaryCta, config?.portalUrl])

  useEffect(() => {
    const handleUnload = () => {
      window.parent.postMessage({ type: 'header.primaryCta' }, 'https://dashboard.copilot.com')
      if (config?.portalUrl) {
        window.parent.postMessage({ type: 'header.primaryCta' }, ensureHttps(config.portalUrl))
      }
    }
    addEventListener('beforeunload', handleUnload)
    return () => {
      removeEventListener('beforeunload', handleUnload)
    }
  }, [config?.portalUrl])
}
