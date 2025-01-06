import DBClient from '@/lib/db'
import { ActivityLog, ActivityType } from '@prisma/client'
import Bottleneck from 'bottleneck'

/**
 * cmd script to fill up 'X changed status from Y to Z' activity logs for tasks
 */
export const fillWorkflowStateUpdated = async () => {
  const db = DBClient.getInstance()
  // Gets all non-soft deleted tasks that don't have a corresponding activity log pointing to it
  const corruptLogs: ActivityLog[] = await db.$queryRaw`
    SELECT * FROM "ActivityLogs"
    WHERE type = 'WORKFLOW_STATE_UPDATED'
      AND (
        details::jsonb ? 'newWorkflowState'
        OR details::jsonb ? 'oldWorkflowState'
      )
  `

  if (!corruptLogs.length) {
    console.info('All clear captain!')
    return
  }

  const data = []

  for (let i = 0; i < corruptLogs.length; i++) {
    const log = corruptLogs[i]
    console.info(`    🛠️ Queued fix for activity log ${i + 1}/${corruptLogs.length} for task ${log.taskId}...`)
    if (!log.details) {
      await db.activityLog.delete({ where: { id: log.id } })
      return
    }
    const corruptLog = log.details as { oldWorkflowState: { id: string }; newWorkflowState: { id: string } }
    const details = {
      oldValue: corruptLog.oldWorkflowState.id,
      newValue: corruptLog.newWorkflowState.id,
    }
    if (!details.oldValue || !details.newValue) {
      throw new Error(
        `Encountered corrupt activity logs with no oldValue / newValue: ${corruptLog.toString()}. No activity logs were added.`,
      )
    }
    data.push({ id: log.id, details })
  }

  const bottleneck = new Bottleneck({
    minTime: 100,
    maxConcurrent: 5, // 5 connection limit to be safe
  })

  const updatePromises = []
  for (let { id, details } of data) {
    updatePromises.push(
      bottleneck.schedule(() =>
        db.activityLog.update({
          where: { id },
          data: { details },
        }),
      ),
    )
  }

  await Promise.all(updatePromises)
}
