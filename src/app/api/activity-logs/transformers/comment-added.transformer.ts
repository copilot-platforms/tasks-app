import { CommendAddedDetails, CommentAddedSchema } from '@api/activity-logs/schemas/CommentAddedSchema'

export class CommentAddedTransformer {
  transform(details: CommendAddedDetails) {
    return {
      id: details.id,
      content: details.content,
      initiatorId: details.initiatorId,
      parentId: details.parentId,
    }
  }
}
