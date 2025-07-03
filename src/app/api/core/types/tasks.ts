/**
 * Enum of all possible notification actions for tasks.
 */
export enum NotificationTaskActions {
  Assigned = 'assigned',
  AssignedToCompany = 'assignedToCompany',
  ReassignedToIU = 'reassignedToIu',
  ReassignedToClient = 'reassignedToClient',
  ReassignedToCompany = 'reassignedToCompany',
  CompletedByCompanyMember = 'completedByCompanyMember',
  CompletedForCompanyByIU = 'completedForCompanyByIu',
  Completed = 'completed',
  CompletedByIU = 'completedByIu',
  Commented = 'commented',
  CommentToCU = 'commentToCU', // sub-action of Commented
  CommentToIU = 'commentToIU', // sub-action of Commented
  Mentioned = 'mentioned',
}

/**
 * Timestamps for task assignment and completion.
 */
export interface TaskTimestamps {
  readonly assignedAt: Date | null
  readonly completedAt: Date | null
}
