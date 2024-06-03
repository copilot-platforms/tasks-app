import { Prisma, PrismaClient, StateType, WorkflowState } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

export async function getWorkflowStatesByWorkspace(
  db: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  workspaceId: string,
): Promise<WorkflowState[]> {
  const query = Prisma.sql`
  SELECT * FROM "WorkflowStates"
    WHERE "workspaceId" = ${workspaceId} AND "deletedAt" IS NULL
    ORDER BY 
      CASE 
      WHEN "type" = ${Prisma.raw(`'${StateType.unstarted}'`)} THEN 0
      WHEN "type" = ${Prisma.raw(`'${StateType.started}'`)} THEN 1
      WHEN "type" = ${Prisma.raw(`'${StateType.completed}'`)} THEN 2
      ELSE 3
      END;
  `
  return await db.$queryRaw`${query}`
}
