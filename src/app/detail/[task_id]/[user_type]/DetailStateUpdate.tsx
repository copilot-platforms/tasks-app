import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { getAllTasks, getAllWorkflowStates, getViewSettings } from '@/app/(home)/page'
import { Token, WorkspaceResponse } from '@/types/common'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { AssigneeFetcher } from '@/app/_fetchers/AssigneeFetcher'
import { UserType } from '@/types/interfaces'

interface DetailStateUpdateProps {
  isRedirect?: boolean
  token: string
  tokenPayload: Token | null
  task: TaskResponse
  children: React.ReactNode
  workspace?: WorkspaceResponse
}

export const DetailStateUpdate = async ({
  isRedirect,
  token,
  tokenPayload,
  task,
  workspace,
  children,
}: DetailStateUpdateProps) => {
  if (!isRedirect) {
    return (
      <ClientSideStateUpdate token={token} tokenPayload={tokenPayload} task={task} workspace={workspace}>
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
      task={task}
      workspace={workspace}
    >
      {/* Notification CTA redirects only happen for IUs through notification center, or clients from emails  */}
      {tokenPayload && (
        <AssigneeFetcher
          token={token}
          userType={tokenPayload.internalUserId ? UserType.INTERNAL_USER : UserType.CLIENT_USER}
          tokenPayload={tokenPayload}
        />
      )}

      {children}
    </ClientSideStateUpdate>
  )
}
