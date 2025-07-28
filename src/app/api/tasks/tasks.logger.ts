import { TasksService } from '@/app/api/tasks/tasks.service'
import { ArchivedStateUpdatedSchema } from '@api/activity-logs/schemas/ArchiveStateUpdatedSchema'
import { DueDateChangedSchema } from '@api/activity-logs/schemas/DueDateChangedSchema'
import { TaskAssignedSchema } from '@api/activity-logs/schemas/TaskAssignedSchema'
import { TaskCreatedSchema } from '@api/activity-logs/schemas/TaskCreatedSchema'
import { TitleUpdatedSchema } from '@api/activity-logs/schemas/TitleUpdatedSchema'
import { WorkflowStateUpdatedSchema } from '@api/activity-logs/schemas/WorkflowStateUpdatedSchema'
import { ActivityLogger } from '@api/activity-logs/services/activity-logger.service'
import User from '@api/core/models/User.model'
import { BaseService } from '@api/core/services/base.service'
import { ActivityType, AssigneeType, Task, WorkflowState } from '@prisma/client'

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

  async logNewTask(createdBy?: { userId: string; role: AssigneeType }) {
    await this.logTaskCreated(createdBy)
  }

  async logTaskUpdated(prevTask: Task & { workflowState: WorkflowState }) {
    const tasksService = new TasksService(this.user)
    let shouldUpdateLastActivityLog = false
    const setUpdate = () => (shouldUpdateLastActivityLog = true)
    if (this.task.assigneeId !== prevTask.assigneeId) {
      await this.logTaskAssigneeUpdated(prevTask)
      setUpdate()
    }
    if (this.task.workflowStateId !== prevTask?.workflowStateId) {
      await this.logWorkflowStateUpdated(prevTask)
      setUpdate()
    }
    if (this.task.isArchived !== prevTask.isArchived) {
      await this.logArchiveStateUpdated(prevTask)
      setUpdate()
    }
    if (this.task.dueDate !== prevTask.dueDate) {
      await this.logDueDateChanged(prevTask)
      setUpdate()
    }
    if (this.task.title.trim() !== prevTask.title.trim()) {
      await this.logTitleUpdated(prevTask)
      setUpdate()
    }

    if (shouldUpdateLastActivityLog) {
      await tasksService.setNewLastActivityLogUpdated(this.task.id)
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

  private async logArchiveStateUpdated(prevTask: Task) {
    await this.activityLogger.log(
      ActivityType.ARCHIVE_STATE_UPDATED,
      ArchivedStateUpdatedSchema.parse({
        oldValue: prevTask.isArchived,
        newValue: this.task.isArchived,
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

  private async logTitleUpdated(prevTask: Task) {
    await this.activityLogger.log(
      ActivityType.TITLE_UPDATED,
      TitleUpdatedSchema.parse({
        oldValue: prevTask.title,
        newValue: this.task.title,
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

  private async logTaskCreated(createdBy?: { userId: string; role: AssigneeType }) {
    await this.activityLogger.log(
      ActivityType.TASK_CREATED,
      TaskCreatedSchema.parse({
        taskId: this.task.id,
      }),
      createdBy,
    )
  }
}
