import DBClient from '@/lib/db'
import { Comment, CommentInitiator } from '@prisma/client'
import Bottleneck from 'bottleneck'

const copilotAPIKey = process.env.COPILOT_API_KEY
const assemblyApiDomain = process.env.NEXT_PUBLIC_ASSEMBLY_API_DOMAIN
const COPILOT_CLIENTS_ENDPOINT = `${assemblyApiDomain}/v1/clients?limit=10000`
const COPILOT_IUS_ENDPOINT = `${assemblyApiDomain}/v1/internal-users?limit=10000`

type InitiatorMap = Map<string, CommentInitiator>

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

  const workspaceInitiatorMap: Record<string, InitiatorMap> = {}
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

    const initiatorMap: InitiatorMap = new Map()
    internalUser.forEach((user: any) => {
      initiatorMap.set(user.id, CommentInitiator.internalUser)
    })
    client.forEach((c: any) => {
      initiatorMap.set(c.id, CommentInitiator.client)
    })

    workspaceInitiatorMap[workspaceId] = initiatorMap

    console.info(
      `[${completedCount}/${totalWorkspaces}] Fetched workspace ${workspaceId}: ${internalUser.length} internal users, ${client.length} clients`,
    )
  }

  await Promise.all(uniqueWorkspaceIds.map((workspaceId) => fetchWorkspaceData(workspaceId)))
  console.info(`\nCompleted fetching workspace data:`)
  console.info(`Successful: ${Object.keys(workspaceInitiatorMap).length}`)
  console.info(`Failed: ${failedWorkspaces.length}`)
  return { workspaceInitiatorMap, failedWorkspaces }
}

const updateComments = async (
  comments: Comment[],
  workspaceInitiatorMap: Record<string, InitiatorMap>,
  db: ReturnType<typeof DBClient.getInstance>,
) => {
  const failedEntries: Comment[] = []
  const internalUserIds: string[] = []
  const clientIds: string[] = []

  for (const comment of comments) {
    if (comment.initiatorType !== null) continue

    const initiatorMap = workspaceInitiatorMap[comment.workspaceId]
    if (!initiatorMap) {
      failedEntries.push(comment)
      continue
    }

    const initiatorType = initiatorMap.get(comment.initiatorId)

    if (!initiatorType) {
      failedEntries.push(comment)
      continue
    }

    if (initiatorType === CommentInitiator.internalUser) {
      internalUserIds.push(comment.id)
    } else {
      clientIds.push(comment.id)
    }
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
  const { workspaceInitiatorMap } = await getUsersMap(uniqueWorkspaceIds)

  await updateComments(comments, workspaceInitiatorMap, db)
}

run()
