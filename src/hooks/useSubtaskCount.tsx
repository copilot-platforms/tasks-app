import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

export const useSubtaskCount = (taskId: string) => {
  const { accessibleTasks } = useSelector(selectTaskBoard)
  const subtaskCount = useMemo(() => {
    return accessibleTasks.filter((t) => t.parentId === taskId).length
  }, [accessibleTasks, taskId])

  return subtaskCount
}
