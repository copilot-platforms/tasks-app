import { TemplateResponsePublic, TemplateResponsePublicSchema } from '@/types/dto/templates.dto'
import { TaskTemplate } from '@prisma/client'

export class TemplateSerializer {
  constructor(private template: TaskTemplate) {
    this.template = template
  }

  serialize(): TemplateResponsePublic {
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
