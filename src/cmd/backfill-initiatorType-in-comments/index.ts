import DBClient from '@/lib/db'
import { Comment, CommentInitiator } from '@prisma/client'
import Bottleneck from 'bottleneck'

const copilotAPIKey = process.env.COPILOT_API_KEY
const assemblyApiDomain = process.env.NEXT_PUBLIC_ASSEMBLY_API_DOMAIN
const COPILOT_CLIENTS_ENDPOINT = `${assemblyApiDomain}/v1/clients?limit=10000`
const COPILOT_IUS_ENDPOINT = `${assemblyApiDomain}/v1/internal-users?limit=10000`

type WorkspaceUsersData = {
  internalUser: any[]
  client: any[]
}

const fetchWithWorkspaceKey = async (url: string, workspaceId: string) => {
  const resp = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': `${workspaceId}/${copilotAPIKey}`,
    },
  })

  if (!resp.ok) return null
  return (await resp.json())?.data ?? null
}

const getUsersMap = async (uniqueWorkspaceIds: string[]) => {
  const copilotBottleneck = new Bottleneck({ maxConcurrent: 6, minTime: 200 })

  const workspaceUsersMap: Record<string, WorkspaceUsersData> = {}
  const failedWorkspaces: string[] = []
  let completedCount = 0
  const totalWorkspaces = uniqueWorkspaceIds.length

  console.info(`Starting to fetch data for ${totalWorkspaces} workspaces...`)

  const fetchWorkspaceData = async (workspaceId: string) => {
    const [client, internalUser] = await Promise.all([
      copilotBottleneck.schedule(() => fetchWithWorkspaceKey(COPILOT_CLIENTS_ENDPOINT, workspaceId)),
      copilotBottleneck.schedule(() => fetchWithWorkspaceKey(COPILOT_IUS_ENDPOINT, workspaceId)),
    ])
    completedCount++

    if (!client || !internalUser) {
      failedWorkspaces.push(workspaceId)
      console.warn(`[${completedCount}/${totalWorkspaces}] Failed to fetch data for workspace: ${workspaceId}`)
      return
    }

    workspaceUsersMap[workspaceId] = {
      internalUser,
      client,
    }
    console.info(
      `[${completedCount}/${totalWorkspaces}] Fetched workspace ${workspaceId}: ${internalUser.length} internal users, ${client.length} clients`,
    )
  }

  await Promise.all(uniqueWorkspaceIds.map((workspaceId) => fetchWorkspaceData(workspaceId)))
  console.info(`\nCompleted fetching workspace data:`)
  console.info(`Successful: ${Object.keys(workspaceUsersMap).length}`)
  console.info(`Failed: ${failedWorkspaces.length}`)
  return { workspaceUsersMap, failedWorkspaces }
}

const updateComments = async (
  comments: Comment[],
  workspaceUsersMap: Record<string, WorkspaceUsersData>,
  db: ReturnType<typeof DBClient.getInstance>,
) => {
  const failedEntries: Comment[] = []
  const internalUserIds: string[] = []
  const clientIds: string[] = []

  for (const comment of comments) {
    if (comment.initiatorType !== null) continue

    if (!workspaceUsersMap[comment.workspaceId]) {
      failedEntries.push(comment)
      continue
    }

    const { internalUser, client } = workspaceUsersMap[comment.workspaceId]

    const isInternalUser = internalUser.some((user: any) => user.id === comment.initiatorId)

    if (isInternalUser) {
      internalUserIds.push(comment.id)
      continue
    }

    const isClient = client.some((c: any) => c.id === comment.initiatorId)

    if (isClient) {
      clientIds.push(comment.id)
      continue
    }

    failedEntries.push(comment)
  }

  if (internalUserIds.length > 0) {
    await db.comment.updateMany({
      where: { id: { in: internalUserIds } },
      data: { initiatorType: CommentInitiator.internalUser },
    })
  }

  if (clientIds.length > 0) {
    await db.comment.updateMany({
      where: { id: { in: clientIds } },
      data: { initiatorType: CommentInitiator.client },
    })
  }

  console.info(`Updated ${internalUserIds.length} internal user comments`)
  console.info(`Updated ${clientIds.length} client comments`)
  console.info(`Failed entries: ${failedEntries.length}`)

  return {
    updatedCount: internalUserIds.length + clientIds.length,
    failedEntries,
  }
}

const run = async () => {
  const db = DBClient.getInstance()

  const comments = await db.comment.findMany({
    where: { initiatorType: null },
  })

  const uniqueWorkspaceIds = [...new Set(comments.map((t) => t.workspaceId))]
  const { workspaceUsersMap } = await getUsersMap(uniqueWorkspaceIds)

  await updateComments(comments, workspaceUsersMap, db)
}

run()
