export enum NotificationTaskActions {
  Assigned = 'assigned',
  AssignedToCompany = 'assignedToCompany',
  ReassignedToIU = 'reassignedToIu',
  CompletedByCompanyMember = 'completedByCompanyMember',
  CompletedForCompanyByIU = 'completedForCompanyByIu',
  Completed = 'completed',
  CompletedByIU = 'completedByIu',
  Commented = 'commented',
  Mentioned = 'mentioned',
}

export type TaskTimestamps = {
  assignedAt: Date | null
  completedAt: Date | null
}
