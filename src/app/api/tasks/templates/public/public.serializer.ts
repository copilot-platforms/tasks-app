import {
  SubTemplateResponsePublic,
  SubTemplateResponsePublicSchema,
  TemplateResponsePublic,
  TemplateResponsePublicSchema,
} from '@api/tasks/templates/public/public.dto'
import { toRFC3339 } from '@/utils/dateHelper'
import { TaskTemplate } from '@prisma/client'
import { z } from 'zod'

type TaskTemplateWithSubtasks = TaskTemplate & {
  subTaskTemplates?: TaskTemplateWithSubtasks[]
}
export class PublicTemplateSerializer {
  static serialize(
    template: TaskTemplateWithSubtasks | TaskTemplateWithSubtasks[],
    isSubTaskTemplate: boolean = false,
  ): TemplateResponsePublic | TemplateResponsePublic[] | SubTemplateResponsePublic | SubTemplateResponsePublic[] {
    if (Array.isArray(template)) {
      return z.array(isSubTaskTemplate ? SubTemplateResponsePublicSchema : TemplateResponsePublicSchema).parse(
        template.map((template) => ({
          id: template.id,
          object: 'taskTemplate',
          name: template.title,
          description: template.body,
          createdDate: toRFC3339(template.createdAt),
          ...(!isSubTaskTemplate && {
            subTaskTemplates: template.subTaskTemplates?.map((sub) => this.serialize(sub, true)) ?? [],
          }),
        })),
      )
    }

    return (isSubTaskTemplate ? SubTemplateResponsePublicSchema : TemplateResponsePublicSchema).parse({
      id: template.id,
      object: 'taskTemplate',
      name: template.title,
      description: template.body,
      createdDate: toRFC3339(template.createdAt),
      ...(!isSubTaskTemplate && {
        subTaskTemplates: template.subTaskTemplates?.map((sub) => this.serialize(sub, true)) ?? [],
      }),
    })
  }
}
