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
  private static MAX_DEPTH = 2

  static serialize(
    template: TaskTemplateWithSubtasks | TaskTemplateWithSubtasks[],
    isSubTaskTemplate: boolean = false,
    depth: number = 0,
  ): TemplateResponsePublic | TemplateResponsePublic[] | SubTemplateResponsePublic | SubTemplateResponsePublic[] {
    if (depth > this.MAX_DEPTH) {
      throw new Error(`Max recursion depth of ${this.MAX_DEPTH} exceeded for sub-templates.`)
    }
    const templateSchema = isSubTaskTemplate ? SubTemplateResponsePublicSchema : TemplateResponsePublicSchema
    if (Array.isArray(template)) {
      return z.array(templateSchema).parse(
        template.map((template) => ({
          id: template.id,
          object: 'taskTemplate',
          name: template.title,
          description: template.body,
          createdDate: toRFC3339(template.createdAt),
          ...(!isSubTaskTemplate && {
            subTaskTemplates: this.serialize(template.subTaskTemplates ?? [], true, depth + 1),
          }),
        })),
      )
    }

    return templateSchema.parse({
      id: template.id,
      object: 'taskTemplate',
      name: template.title,
      description: template.body,
      createdDate: toRFC3339(template.createdAt),
      ...(!isSubTaskTemplate && {
        subTaskTemplates: this.serialize(template.subTaskTemplates ?? [], true, depth + 1),
      }),
    })
  }
}
