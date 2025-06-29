/**
 * Enum of all resource types accessible by the Tasks API.
 */
export enum Resource {
  Tasks = 'Task',
  TaskTemplates = 'TaskTemplates',
  WorkflowState = 'WorkflowState',
  ViewSetting = 'ViewSetting',
  Users = 'User',
  Attachments = 'Attachments',
  Comment = 'Comments',
  ScrapMedias = 'ScrapMedias',
  Notifications = 'Notifications',
}

/**
 * Route params for endpoints using a UUID as a dynamic param.
 */
export interface IdParams {
  readonly params: {
    readonly id: string
  }
}
