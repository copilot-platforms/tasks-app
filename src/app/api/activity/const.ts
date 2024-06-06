import { ActivityType } from '@prisma/client'
import { TaskCreatedSchema } from '@api/activity/schemas/TaskCreatedSchema'
import { TaskAssignedSchema } from '@api/activity/schemas/TaskAssignedSchema'
import { WorkflowStateUpdatedSchema } from '@api/activity/schemas/WorkflowStateUpdatedSchema'

export const SchemaByActivityType = {
  [ActivityType.CREATE_TASK]: TaskCreatedSchema,
  [ActivityType.ASSIGN_TASK]: TaskAssignedSchema,
  [ActivityType.WORKFLOWSTATE_UPDATE]: WorkflowStateUpdatedSchema,
}
