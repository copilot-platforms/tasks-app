import { UserRole } from '@/app/api/core/types/user'
import { ActivityType } from '@prisma/client'
import { z } from 'zod'

export const TaskCreatedDetailsSchema = z.object({
  // We could also use the activity log's createdAt but that would cause a small inconsistency,
  // especially when we're in smaller timeDifference intervals like seconds, minutes, etc
  dateTime: z.string().datetime(),
})
export type TaskCreatedDetails = z.infer<typeof TaskCreatedDetailsSchema>
export type ValidActivityDetails = TaskCreatedDetails // Add more here

export const DetailsSchemaMap: Partial<Record<ActivityType, any>> = {
  [ActivityType.TASK_CREATED]: TaskCreatedDetailsSchema,
}

export const ActivityLogSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  workspaceId: z.string(),
  type: z.nativeEnum(ActivityType),
  details: TaskCreatedDetailsSchema,
  // NOTE: Add a zod union with refine / superRefine when other types of activity logs are supported like this
  // details: z.union([TaskCreatedDetailsSchema, OtherSchema]).superRefine((data, ctx) => {
  //   const Schema = DetailsSchemaMap[data.type]
  //   if (!Schema.safeParse(data.details).success) {
  //     ctx.addIssue({
  //       code: z.ZodIssueCode.custom,
  //       message: `Details does not match schema for type ${data.type}`
  //       path: ['details']
  //     })
  //   }
  // })
  userId: z.string().uuid(),
  userRole: z.nativeEnum(UserRole),
  createdAt: z.string().datetime(),
})
export type ActivityLog = z.infer<typeof ActivityLogSchema>
