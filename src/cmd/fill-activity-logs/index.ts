import DBClient from '@/lib/db'
import { ActivityType, AssigneeType } from '@prisma/client'

/**
 * cmd script to fill up 'created by X on Y' activity logs for tasks
 */
const run = async () => {
  const db = DBClient.getInstance()
  // Gets all non-soft deleted tasks that don't have a corresponding activity log pointing to it
  const tasks = await db.task.findMany({
    where: { activityLog: { none: { type: ActivityType.TASK_CREATED } } },
  })
  if (!tasks.length) {
    console.info('All clear captain!')
  }
  console.warn(`⚠️ ${tasks.length} tasks don't have a Task Created log yet!`)
  const data = []

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    console.info(`    🛠️ Inserting activity log ${i + 1}/${tasks.length} for task ${task.id} (${task.title})...`)
    const details = {
      id: task.id,
      body: '',
      title: task.title,
      assigneeId: task.assigneeId,
      workspaceId: task.workspaceId,
      assigneeType: task.assigneeType,
    }
    data.push({
      taskId: task.id,
      workspaceId: task.workspaceId,
      type: ActivityType.TASK_CREATED,
      userId: task.createdById,
      userRole: AssigneeType.internalUser,
      details,
      createdAt: task.createdAt,
    })
  }

  await db.activityLog.createMany({ data })
}

run()
