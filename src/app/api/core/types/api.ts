/**
 * Resource store made accessible by Tasks API
 */
export enum Resource {
  Tasks = 'Task',
  WorkflowState = 'WorkflowState',
  Users = 'User',
}

/**
 * NextParam when uuid is being used as a dynamic param (slug) for accessing a resource
 */
export type IdParams = {
  params: {
    id: string
  }
}
