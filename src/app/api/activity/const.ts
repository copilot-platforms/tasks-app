import { ActivityType } from '@prisma/client'
import { TaskCreatedSchema } from '@api/activity/schemas/TaskCreatedSchema'
import { TaskAssignedSchema } from '@api/activity/schemas/TaskAssignedSchema'
import { WorkflowStateUpdatedSchema } from '@api/activity/schemas/WorkflowStateUpdatedSchema'

export const SchemaByActivityType = {
  [ActivityType.TASK_CREATED]: TaskCreatedSchema,
  [ActivityType.TASK_ASSIGNED]: TaskAssignedSchema,
  [ActivityType.WORKFLOW_STATE_UPDATED]: WorkflowStateUpdatedSchema,
}
