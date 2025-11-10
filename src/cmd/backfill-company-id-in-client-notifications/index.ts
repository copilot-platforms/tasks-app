import { copilotApiDomain } from '@/config'
import DBClient from '@/lib/db'
import { ClientNotification } from '@prisma/client'
import Bottleneck from 'bottleneck'
import { z } from 'zod'

interface Clientable {
  id: string
  companyId: string
}

const copilotAPIKey = process.env.COPILOT_API_KEY
const COPILOT_CLIENTS_ENDPOINT = `${copilotApiDomain}/v1/clients?limit=10000`

const getCompanyMap = async (uniqueWorkspaceIds: Array<string>) => {
  const workspaceClientCompanyIdMap: Record<string, Record<string, string>> = {}
  const failedWorkspaces: Array<string> = []

  // Fetch and set workspaceId + client-company id mapping
  for (let workspaceId of uniqueWorkspaceIds) {
    console.info(`backfill-company-id#run | Running backfill for clientNotifications under workspace id ${workspaceId}`)
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

const updateClientNotifications = async (
  clientNotifications: (ClientNotification & {
    task: {
      workspaceId: string
    }
  })[],
  workspaceClientCompanyIdMap: Record<string, Record<string, string>>,
  failedWorkspaces: Array<string>,
) => {
  const db = DBClient.getInstance()
  const dbBottleneck = new Bottleneck({ minTime: 200, maxConcurrent: 50 })

  const failedClientNotifications: Array<string> = []
  const updatePromises = []

  for (let clientNotification of clientNotifications) {
    if (failedWorkspaces.includes(clientNotification.task.workspaceId)) {
      failedClientNotifications.push(clientNotification.id)
      continue
    }

    const companyId =
      workspaceClientCompanyIdMap[clientNotification.task.workspaceId][z.string().uuid().parse(clientNotification.clientId)]
    updatePromises.push(
      db.clientNotification.update({
        where: { id: clientNotification.id },
        data: { companyId },
      }),
    )
  }

  await Promise.all(updatePromises.map((promise) => dbBottleneck.schedule(() => promise)))

  return { failedClientNotifications }
}

export const backfillCompanyIdInClientNotifications = async () => {
  console.info(`backfill-company-id#run | Using clients endpoint:`, COPILOT_CLIENTS_ENDPOINT)

  const db = DBClient.getInstance()
  const clientNotifications = await db.clientNotification.findMany({
    where: { companyId: null },
    include: {
      task: {
        select: {
          workspaceId: true,
        },
      },
    },
  })

  const uniqueWorkspaceIds = [...new Set(clientNotifications.map((el) => el.task.workspaceId))]

  console.info(`backfill-company-id#run | All workspace ids (${uniqueWorkspaceIds.length})`, uniqueWorkspaceIds)
  // Map with workspaceId -> clientId -> companyId
  const { workspaceClientCompanyIdMap, failedWorkspaces } = await getCompanyMap(uniqueWorkspaceIds)

  // Update client notifications in db
  const { failedClientNotifications } = await updateClientNotifications(
    clientNotifications,
    workspaceClientCompanyIdMap,
    failedWorkspaces,
  )

  console.info(`Failed workspaces (${failedWorkspaces.length})`, failedWorkspaces)
  console.info(`Failed update on clientNotifications (${failedClientNotifications.length})`, failedClientNotifications)
}

backfillCompanyIdInClientNotifications()
