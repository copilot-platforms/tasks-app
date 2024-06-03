export enum NotificationTaskActions {
  Assigned = 'assigned',
  Completed = 'completed',
}

export type TaskTimestamps = {
  assignedAt: Date | null
  completedAt: Date | null
}
