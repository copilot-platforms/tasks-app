export const getDeleteMessage = (opts?: { subtaskCount?: number }) => {
  if (opts?.subtaskCount) {
    return `This will also delete ${opts?.subtaskCount} subtasks. This action can’t be undone.`
  }
  return 'This action can’t be undone.'
}
