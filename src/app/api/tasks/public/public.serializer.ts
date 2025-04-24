import { RFC3339DateSchema } from '@/types/common'
import { toRFC3339 } from '@/utils/dateHelper'
import { PublicTaskDto, PublicTaskDtoSchema } from '@api/tasks/public/public.dto'
import { Task, WorkflowState } from '@prisma/client'
import { z } from 'zod'

const statusMap: Record<WorkflowState['type'], PublicTaskDto['status']> = Object.freeze({
  backlog: 'todo',
  unstarted: 'todo',
  started: 'inProgress',
  completed: 'completed',
  cancelled: 'todo',
})

export class PublicTaskSerializer {
  static serializeUnsafe(task: Task & { workflowState: WorkflowState }): PublicTaskDto {
    return {
      id: task.id,
      object: 'task',
      name: task.title,
      description: task.body || '',
      parentTaskId: task.parentId,
      assigneeId: task.assigneeId,
      assigneeType: task.assigneeType,
      dueDate: toRFC3339(task.dueDate),
      label: task.label,
      status: statusMap[task.workflowState.type],
      createdBy: task.createdById,
      completedDate: toRFC3339(task.completedAt),
      creatorType: 'internalUser',
      createdDate: RFC3339DateSchema.parse(toRFC3339(task.createdAt)),
      isArchived: task.isArchived,
      archivedDate: toRFC3339(task.lastArchivedDate),
      isDeleted: task.deletedAt ? true : false,
      deletedDate: toRFC3339(task.deletedAt),
      source: 'web', // Placeholder for now
    }
  }

  static serialize(task: Task & { workflowState: WorkflowState }): PublicTaskDto {
    return PublicTaskDtoSchema.parse(PublicTaskSerializer.serializeUnsafe(task))
  }

  static serializeMany(tasks: (Task & { workflowState: WorkflowState })[]): PublicTaskDto[] {
    return z.array(PublicTaskDtoSchema).parse(tasks.map((task) => PublicTaskSerializer.serializeUnsafe(task)))
  }

  static deserialize() {
    // TODO: Implement while implementing public create endpoint
    return {}
  }
}
