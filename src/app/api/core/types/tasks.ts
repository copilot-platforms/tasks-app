export enum NotificationTaskActions {
  Assigned = 'assigned',
  AssignedToCompany = 'assignedToCompany',
  CompletedByCompanyMember = 'completedByCompanyMember',
  Completed = 'completed',
  Commented = 'commented',
  Mentioned = 'mentioned',
}

export type TaskTimestamps = {
  assignedAt: Date | null
  completedAt: Date | null
}
