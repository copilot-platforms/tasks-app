export enum NotificationTaskActions {
  Assigned = 'assigned',
  Completed = 'completed',
  Commented = 'commented',
  Mentioned = 'mentioned',
}

export type TaskTimestamps = {
  assignedAt: Date | null
  completedAt: Date | null
}
