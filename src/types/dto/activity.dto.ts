import { z } from 'zod'
import { UpdateTaskRequestSchema } from './tasks.dto'
import { UserRole } from '@/app/api/core/types/user'

export const UserSchema = z.object({
  token: z.string(),
  role: z.nativeEnum(UserRole),
  workspaceId: z.string(),
  clientId: z.string().optional(),
  companyId: z.string().optional(),
  internalUserId: z.string().optional(),
})

export const CreateActivitySchema = z.object({
  user: UserSchema,
  task: UpdateTaskRequestSchema,
})
