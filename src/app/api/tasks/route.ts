import { createTask, getTasks } from '@api/tasks/tasks.controller'

export const GET = getTasks
export const POST = createTask
