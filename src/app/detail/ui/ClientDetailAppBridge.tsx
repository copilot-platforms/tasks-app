'use client'

import { Icons } from '@/hooks/app-bridge/types'
import { usePrimaryCta } from '@/hooks/app-bridge/usePrimaryCta'
import { useSecondaryCta } from '@/hooks/app-bridge/useSecondaryCta'
import { useCallback, useEffect, useState } from 'react'

interface DetailAppBridgeProps {
  handleTaskComplete: () => void
  isTaskCompleted: boolean
  portalUrl?: string
}

export const ClientDetailAppBridge = ({ handleTaskComplete, isTaskCompleted, portalUrl }: DetailAppBridgeProps) => {
  const [awake, setAwake] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setAwake(true)
    }, 0)
  }, [])

  const handleMarkAsDone = useCallback(() => {
    handleTaskComplete()
    // "awaken" callback using one more render to avoid hydration issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awake])

  usePrimaryCta(
    isTaskCompleted
      ? null
      : {
          label: 'Mark as Done',
          icon: Icons.CHECK,
          onClick: handleMarkAsDone,
        },
    { portalUrl },
  )
  useSecondaryCta(null, { portalUrl })

  return <></>
}
