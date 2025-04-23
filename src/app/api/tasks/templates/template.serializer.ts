import { TemplateResponsePublic, TemplateResponsePublicSchema } from '@/types/dto/templates.dto'
import { TaskTemplate } from '@prisma/client'

export class TemplateSerializer {
  constructor(private template: TaskTemplate | TaskTemplate[]) {}

  serialize(): TemplateResponsePublic | TemplateResponsePublic[] {
    if (Array.isArray(this.template)) {
      return this.template.map((template) => {
        const serializedTemplate = {
          id: template.id,
          object: 'taskTemplate',
          name: template.title,
          description: template.body,
          createdDate: template.createdAt,
        }
        return TemplateResponsePublicSchema.parse(serializedTemplate)
      })
    }

    const serializedTemplate = {
      id: this.template.id,
      object: 'taskTemplate',
      name: this.template.title,
      description: this.template.body,
      createdDate: this.template.createdAt,
    }

    return TemplateResponsePublicSchema.parse(serializedTemplate)
  }
}
