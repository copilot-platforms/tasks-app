import { z } from 'zod'
import { StateType } from '@prisma/client'

export const WorkflowStateUpdatedSchema = z.object({
  oldWorkflowState: z.object({
    id: z.string().uuid(),
    type: z.nativeEnum(StateType),
    name: z.string(),
    key: z.string(),
    color: z.string().nullable(),
  }),
  newWorkflowState: z.object({
    id: z.string().uuid(),
    type: z.nativeEnum(StateType),
    name: z.string(),
    key: z.string(),
    color: z.string().nullable(),
  }),
})
