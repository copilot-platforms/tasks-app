import { TaskAssignedResponse } from '@api/activity-logs/schemas/TaskAssignedSchema'
import DBClient from '@/lib/db'
import { ActivityType, AssigneeType } from '@prisma/client'

/**
 * cmd script to fill up 'X assigned task to Y' activity logs for tasks
 */
export const fillTaskAssigned = async () => {
  const db = DBClient.getInstance()
  // Gets all non-soft deleted tasks that don't have a corresponding activity log pointing to it
  const tasks = await db.task.findMany({
    where: { activityLog: { none: { type: ActivityType.TASK_ASSIGNED } } },
  })
  if (!tasks.length) {
    console.info('All clear captain!')
    return
  }
  console.warn(`⚠️ ${tasks.length} tasks don't have a Task Assigned log yet!`)
  const data = []

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    if (!task.assigneeId) return

    console.info(`    🛠️ Queuing insert activity log ${i + 1}/${tasks.length} for task ${task.id} (${task.title})...`)
    const details: TaskAssignedResponse = {
      oldValue: null,
      newValue: task.assigneeId,
    }

    data.push({
      taskId: task.id,
      workspaceId: task.workspaceId,
      type: ActivityType.TASK_ASSIGNED,
      userId: task.createdById,
      userRole: AssigneeType.internalUser,
      details,
      createdAt: task.createdAt,
    })
  }

  await db.activityLog.createMany({ data })
}
