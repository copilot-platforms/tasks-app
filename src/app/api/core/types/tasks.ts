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
  // these two comment actions below are sub actions of Commented.
  // Its used to handle the cases for CU vs IU being notified of comments appropriately
  CommentToCU = 'commentToCU',
  CommentToIU = 'commentToIU',
  Mentioned = 'mentioned',
  Shared = 'shared',
}

export type TaskTimestamps = {
  assignedAt: Date | null
  completedAt: Date | null
}
