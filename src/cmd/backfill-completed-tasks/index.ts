import DBClient from '@/lib/db'
import { AssigneeType } from '@prisma/client'

export const fillCompletedTasks = async () => {
  const db = DBClient.getInstance()
  const completedWorkflowStates = await db.workflowState.findMany({
    where: { type: 'completed' },
  })
  if (!completedWorkflowStates.length) {
    throw new Error("No 'completed' workflow states found.")
  }
  for (const completedWorkflowState of completedWorkflowStates) {
    const tasks = await db.task.findMany({
      where: {
        workflowStateId: completedWorkflowState.id,
        OR: [{ completedBy: null }, { completedByUserType: null }],
      },
    })
    if (tasks.length === 0) {
      console.info('No tasks to backfill')
      return
    }
    for (const [index, task] of tasks.entries()) {
      console.info(`🛠️ Backfilling task ${index + 1}/${tasks.length} (${task.id} - ${task.title})...`)

      const latestLog = await db.activityLog.findFirst({
        where: {
          taskId: task.id,
          type: 'WORKFLOW_STATE_UPDATED',
        },
        orderBy: { createdAt: 'desc' },
      })

      const fallbackUserId = task.createdById
      const fallbackUserType = AssigneeType.internalUser

      let completedBy = fallbackUserId
      let completedByUserType: AssigneeType = fallbackUserType

      if (
        latestLog &&
        typeof latestLog.details === 'object' &&
        latestLog.details !== null &&
        'newValue' in latestLog.details
      ) {
        const { newValue } = latestLog.details as { newValue: string }
        if (newValue === completedWorkflowState.id) {
          completedBy = latestLog.userId
          completedByUserType = latestLog.userRole
        }
      }

      await db.task.update({
        where: { id: task.id },
        data: {
          completedBy,
          completedByUserType,
        },
      })
    }
  }
}

fillCompletedTasks()
