import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { getAllTasks, getAllWorkflowStates, getViewSettings } from '@/app/page'
import { Token } from '@/types/common'

interface DetailStateUpdateProps {
  isRedirect?: 'true'
  token: string
  tokenPayload: Token | null
  children: React.ReactNode
}

export const DetailStateUpdate = async ({ isRedirect, token, tokenPayload, children }: DetailStateUpdateProps) => {
  if (!isRedirect) {
    return (
      <ClientSideStateUpdate token={token} tokenPayload={tokenPayload}>
        {children}
      </ClientSideStateUpdate>
    )
  }

  // If flow has been redirected from notifications CTA button directly,
  // we must first get context for tasks, workflowStates and viewSettings
  const [workflowStates, tasks, viewSettings] = await Promise.all([
    getAllWorkflowStates(token),
    getAllTasks(token),
    getViewSettings(token),
  ])
  return (
    <ClientSideStateUpdate
      workflowStates={workflowStates}
      tasks={tasks}
      token={token}
      viewSettings={viewSettings}
      tokenPayload={tokenPayload}
    >
      {children}
    </ClientSideStateUpdate>
  )
}
