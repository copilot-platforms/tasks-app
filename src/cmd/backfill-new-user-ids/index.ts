import { assemblyApiDomain } from '@/config'
import DBClient from '@/lib/db'
import { AssigneeType, Task } from '@prisma/client'
import Bottleneck from 'bottleneck'
import { z } from 'zod'

interface Clientable {
  id: string
  companyId: string
}

const copilotAPIKey = process.env.COPILOT_API_KEY // Make sure to source the var beforehand
const COPILOT_CLIENTS_ENDPOINT = `${assemblyApiDomain}/v1/clients?limit=10000`

const getCompanyMap = async (uniqueWorkspaceIds: Array<string>) => {
  const workspaceClientCompanyIdMap: Record<string, Record<string, string>> = {}
  const failedWorkspaces: Array<string> = []

  // Fetch and set workspaceId + client-company id mapping
  for (let workspaceId of uniqueWorkspaceIds) {
    console.info(`backfill-company-id#run | Running backfill for tasks under workspace id ${workspaceId}`)
    const resp = await fetch(COPILOT_CLIENTS_ENDPOINT, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': `${workspaceId}/${copilotAPIKey}`,
      },
    })
    const clients: Clientable[] = (await resp.json())?.data
    if (!clients) {
      console.error(`backfill-company-id#run | Failed to fetch client data for ${workspaceId}`)
      failedWorkspaces.push(workspaceId)
      continue
    }
    workspaceClientCompanyIdMap[workspaceId] = clients.reduce(
      (acc, client) => {
        if (client.id && client.companyId) {
          acc[client.id] = client.companyId
        }
        return acc
      },
      {} as Record<string, string>,
    )
  }
  return { workspaceClientCompanyIdMap, failedWorkspaces }
}

const updateTasks = async (
  tasks: Task[],
  workspaceClientCompanyIdMap: Record<string, Record<string, string>>,
  failedWorkspaces: Array<string>,
) => {
  const db = DBClient.getInstance()
  const dbBottleneck = new Bottleneck({ minTime: 200, maxConcurrent: 50 })

  const failedTasks: Array<string> = []
  const updatePromises = []

  for (let task of tasks) {
    if (failedWorkspaces.includes(task.workspaceId)) {
      failedTasks.push(task.id)
      continue
    }

    if (task.assigneeType === AssigneeType.internalUser) {
      updatePromises.push(
        db.task.update({
          where: { id: task.id },
          data: { internalUserId: task.assigneeId },
        }),
      )
    } else if (task.assigneeType === AssigneeType.client) {
      const companyId = workspaceClientCompanyIdMap[task.workspaceId][z.string().uuid().parse(task.assigneeId)]
      updatePromises.push(
        db.task.update({
          where: { id: task.id },
          data: { clientId: task.assigneeId, companyId },
        }),
      )
    } else if (task.assigneeType === AssigneeType.company) {
      updatePromises.push(
        db.task.update({
          where: { id: task.id },
          data: { companyId: task.assigneeId },
        }),
      )
    }
  }

  await Promise.all(updatePromises.map((promise) => dbBottleneck.schedule(() => promise)))

  return { failedTasks }
}

const run = async () => {
  console.info(`backfill-company-id#run | Using clients endpoint:`, COPILOT_CLIENTS_ENDPOINT)

  const db = DBClient.getInstance()
  const tasks = await db.task.findMany({
    where: { assigneeId: { not: null }, assigneeType: { not: null } },
  })

  const uniqueWorkspaceIds = [...new Set(tasks.map((t) => t.workspaceId))]
  console.info(`backfill-company-id#run | All workspace ids (${uniqueWorkspaceIds.length})`, uniqueWorkspaceIds)
  // Map with workspaceId -> clientId -> companyId
  const { workspaceClientCompanyIdMap, failedWorkspaces } = await getCompanyMap(uniqueWorkspaceIds)

  // Update tasks in db
  const { failedTasks } = await updateTasks(tasks, workspaceClientCompanyIdMap, failedWorkspaces)

  console.info(`Failed workspaces (${failedWorkspaces.length})`, failedWorkspaces)
  console.info(`Failed tasks (${failedTasks.length})`, failedTasks)
}

run()
