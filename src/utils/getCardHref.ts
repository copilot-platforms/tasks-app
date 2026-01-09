import { UserRole } from '@/app/api/core/types/user'

export const getCardHref = (task: { id: string }, mode: UserRole) =>
  `/detail/${task.id}/${mode === UserRole.IU ? 'iu' : 'cu'}` //gets link for a task card

export const getCardHrefTemplate = (template: { id: string }) => `/manage-templates/${template.id}`
