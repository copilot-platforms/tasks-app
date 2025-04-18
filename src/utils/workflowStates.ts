import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { Prisma, PrismaClient, StateType, WorkflowState } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

const listStatePriority: Record<StateType, number> = {
  [StateType.started]: 0,
  [StateType.unstarted]: 1,
  [StateType.completed]: 2,
  [StateType.backlog]: 3,
  [StateType.cancelled]: 4,
}

export async function getWorkflowStatesByWorkspace(
  db: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  workspaceId: string,
): Promise<WorkflowState[]> {
  const query = Prisma.sql`
  SELECT * FROM "WorkflowStates"
    WHERE "workspaceId" = ${workspaceId} AND "deletedAt" IS NULL
    ORDER BY 
      CASE 
        WHEN "type" = 'unstarted' THEN 0
        WHEN "type" = 'started' THEN 1
        WHEN "type" = 'completed' THEN 2
        WHEN "type" = 'backlog' THEN 3
        WHEN "type" = 'cancelled' THEN 4
        ELSE 5
      END;
  `
  return await db.$queryRaw`${query}`
}

export const prioritizeStartedStates = (states: WorkflowStateResponse[]): WorkflowStateResponse[] => {
  return [...states].sort((a, b) => {
    const aPriority = listStatePriority[a.type]
    const bPriority = listStatePriority[b.type]
    return aPriority - bPriority
  })
}
