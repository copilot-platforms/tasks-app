import { TemplateResponsePublic, TemplateResponsePublicSchema } from '@/app/api/tasks/templates/public/public.dto'
import { toRFC3339 } from '@/utils/dateHelper'
import { TaskTemplate } from '@prisma/client'

export class PublicTemplateSerializer {
  static serialize(template: TaskTemplate | TaskTemplate[]): TemplateResponsePublic | TemplateResponsePublic[] {
    if (Array.isArray(template)) {
      return template.map((template) => {
        return TemplateResponsePublicSchema.parse({
          id: template.id,
          object: 'taskTemplate',
          name: template.title,
          description: template.body,
          createdDate: toRFC3339(template.createdAt),
        })
      })
    }

    return TemplateResponsePublicSchema.parse({
      id: template.id,
      object: 'taskTemplate',
      name: template.title,
      description: template.body,
      createdDate: toRFC3339(template.createdAt),
    })
  }
}
