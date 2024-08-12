import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ThemeRegistry from './ThemeRegistry'
import { ProviderWrapper } from '@/redux/ProviderWrapper'
import './tapwrite.css'
import { InterrupCmdK } from '@/hoc/Interrupt_CmdK'
import { headers } from 'next/headers'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { apiUrl } from '@/config'
import { ClientSideStateUpdate } from '@/hoc/ClientSideStateUpdate'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { IAssignee, ITemplate } from '@/types/interfaces'
import { addTypeToAssignee } from '@/utils/addTypeToAssignee'
import { Token, TokenSchema } from '@/types/common'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
import { MAX_FETCH_ASSIGNEE_COUNT } from '@/constants/users'
import { RealTime } from '@/hoc/RealTime'
import { sortTaskByDescendingOrder } from '@/utils/sortTask'
import { z } from 'zod'
import { ProgressLoad } from '@/components/TopLoader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Task App',
  description: 'A comprehensive task app',
}

async function getAllWorkflowStates(token: string): Promise<WorkflowStateResponse[]> {
  const res = await fetch(`${apiUrl}/api/workflow-states?token=${token}`, {
    next: { tags: ['getAllWorkflowStates'] },
  })

  const data = await res.json()

  return data.workflowStates
}

async function getAllTasks(token: string): Promise<TaskResponse[]> {
  const res = await fetch(`${apiUrl}/api/tasks?token=${token}`, {
    next: { tags: ['getTasks'] },
  })

  const data = await res.json()

  return sortTaskByDescendingOrder(data.tasks)
}

async function getTokenPayload(token: string): Promise<Token> {
  const copilotClient = new CopilotAPI(token)
  const payload = TokenSchema.parse(await copilotClient.getTokenPayload())
  return payload as Token
}

async function getAssigneeList(token: string): Promise<IAssignee> {
  const res = await fetch(`${apiUrl}/api/users?token=${token}&limit=${MAX_FETCH_ASSIGNEE_COUNT}`, {
    next: { tags: ['getAssigneeList'] },
  })

  const data = await res.json()

  return data.users
}

async function getViewSettings(token: string): Promise<CreateViewSettingsDTO> {
  const res = await fetch(`${apiUrl}/api/view-settings?token=${token}`, {
    next: { tags: ['getViewSettings'] },
  })
  const data = await res.json()

  return data
}

async function getAllTemplates(token: string): Promise<ITemplate[]> {
  const res = await fetch(`${apiUrl}/api/tasks/templates?token=${token}`, {})

  const templates = await res.json()

  return templates.data
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const token = z.string().parse(headersList.get('clientToken'))

  const [workflowStates, tasks, assignee, viewSettings, tokenPayload, templates] = await Promise.all([
    getAllWorkflowStates(token),
    getAllTasks(token),
    addTypeToAssignee(await getAssigneeList(token)),
    getViewSettings(token),
    getTokenPayload(token),
    getAllTemplates(token),
  ])

  return (
    <html lang="en">
      <body className={inter.className}>
        <ProgressLoad />
        <InterrupCmdK>
          <ProviderWrapper>
            <ClientSideStateUpdate
              workflowStates={workflowStates}
              tasks={tasks}
              token={token}
              assignee={assignee}
              viewSettings={viewSettings}
              tokenPayload={tokenPayload}
              templates={templates}
            >
              <RealTime>
                <ThemeRegistry options={{ key: 'mui' }}>{children}</ThemeRegistry>
              </RealTime>
            </ClientSideStateUpdate>
          </ProviderWrapper>
        </InterrupCmdK>
      </body>
    </html>
  )
}
