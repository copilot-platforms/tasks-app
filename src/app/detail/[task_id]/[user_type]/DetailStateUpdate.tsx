import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { getAllTasks, getAllWorkflowStates, getViewSettings } from '@/app/page'

export const DetailStateUpdate = async ({ isRedirect, token, tokenPayload, children }: any) => {
  if (!isRedirect) {
    return (
      <ClientSideStateUpdate token={token} tokenPayload={tokenPayload}>
        {children}
      </ClientSideStateUpdate>
    )
  }

  // If flow has been redirected from notifications CTA button directly,
  // we must context for tasks, workflowStates and viewSettings
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
