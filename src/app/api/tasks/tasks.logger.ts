import { DueDateChangedSchema } from '@/app/api/activity-logs/schemas/DueDateChangedSchema'
import { TaskCreatedSchema } from '@/app/api/activity-logs/schemas/TaskCreatedSchema'
import { TaskAssignedSchema } from '@api/activity-logs/schemas/TaskAssignedSchema'
import { WorkflowStateUpdatedSchema } from '@api/activity-logs/schemas/WorkflowStateUpdatedSchema'
import { ActivityLogger } from '@api/activity-logs/services/activity-logger.service'
import User from '@api/core/models/User.model'
import { BaseService } from '@api/core/services/base.service'
import { ActivityType, Task, WorkflowState } from '@prisma/client'

/**
 * Wrapper over ActivityLogger to implement a clean abstraction for task creation / update events
 * @param user - Current session user
 * @param task - Current task for creation, or current task after updating for update events
 * @param customCopilotApiKey - Custom API Key for `copilotApi` (optional)
 */
export class TasksActivityLogger extends BaseService {
  private activityLogger: ActivityLogger

  constructor(
    user: User,
    private task: Task & { workflowState: WorkflowState },
    customCopilotApiKey?: string,
  ) {
    super(user, customCopilotApiKey)
    this.activityLogger = new ActivityLogger({ taskId: this.task.id, user })
  }

  async logNewTask() {
    await this.logTaskCreated()
    if (this.task.assigneeId) {
      await this.logTaskAssigneeUpdated()
    }
  }

  async logTaskUpdated(prevTask: Task & { workflowState: WorkflowState }) {
    if (this.task.assigneeId !== prevTask.assigneeId) {
      await this.logTaskAssigneeUpdated(prevTask)
    }
    if (this.task.workflowStateId !== prevTask?.workflowStateId) {
      await this.logWorkflowStateUpdated(prevTask)
    }
    if (this.task.dueDate !== prevTask.dueDate) {
      await this.logDueDateChanged(prevTask)
    }
  }

  private async logWorkflowStateUpdated(prevTask: Task & { workflowState: WorkflowState }) {
    await this.activityLogger.log(
      ActivityType.WORKFLOW_STATE_UPDATED,
      WorkflowStateUpdatedSchema.parse({
        oldValue: prevTask.workflowState.id,
        newValue: this.task.workflowState.id,
      }),
    )
  }

  private async logDueDateChanged(prevTask: Task) {
    await this.activityLogger.log(
      ActivityType.DUE_DATE_CHANGED,
      DueDateChangedSchema.parse({
        oldValue: prevTask.dueDate,
        newValue: this.task.dueDate,
      }),
    )
  }

  private async logTaskAssigneeUpdated(prevTask?: Task & { workflowState: WorkflowState }) {
    await this.activityLogger.log(
      ActivityType.TASK_ASSIGNED,
      TaskAssignedSchema.parse({
        oldValue: prevTask?.assigneeId ?? null,
        newValue: this.task.assigneeId,
      }),
    )
  }

  private async logTaskCreated() {
    await this.activityLogger.log(
      ActivityType.TASK_CREATED,
      TaskCreatedSchema.parse({
        taskId: this.task.id,
      }),
    )
  }
}
