'use client'

import { TaskCardList } from '@/app/detail/ui/TaskCardList'
import { TaskCard } from '@/components/cards/TaskCard'
import { CustomLink } from '@/hoc/CustomLink'
import { DragDropHandler } from '@/hoc/DragDropHandler'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { getCardHref } from '@/utils/getCardHref'
import { UserRole } from '@api/core/types/user'
import { Box } from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useCallback, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import { sortTaskByDescendingOrder } from '@/utils/sortTask'

interface TasksVirtualizerProps {
  rows: TaskResponse[]
  mode: UserRole
  token: string | null
  workflowState?: WorkflowStateResponse
}

// virtualization component used in board view
export function TasksRowVirtualizer({ rows, mode, token, workflowState }: TasksVirtualizerProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const { showSubtasks, accessibleTasks } = useSelector(selectTaskBoard)

  const subtasksByTaskId = useMemo(() => {
    if (!showSubtasks) return {}
    const grouped: Record<string, TaskResponse[]> = {}

    accessibleTasks.forEach((item) => {
      if (!item.parentId) return
      if (!grouped[item.parentId]) grouped[item.parentId] = []
      grouped[item.parentId].push(item)
    })

    Object.keys(grouped).forEach((id) => {
      grouped[id] = sortTaskByDescendingOrder<TaskResponse>(grouped[id])
    })

    return grouped
  }, [accessibleTasks, showSubtasks])

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(
      (index: number) => {
        const task = rows[index]
        let estimate = 70
        if (task.isArchived) estimate += 24
        if (task.dueDate) estimate += 24
        if (task.title && task.title.length > 50) estimate += 20
        return estimate
      },
      [rows],
    ),
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 25,
  })

  return (
    <div
      ref={parentRef}
      className="List"
      style={{
        height: `100vh`,
        width: '100%',
        overflow: 'auto',
        columnGap: '6px',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={(node) => rowVirtualizer.measureElement(node)}
            style={{
              display: 'flex',
              position: 'absolute',
              transform: `translateY(${virtualRow.start}px)`,
              width: '100%',
            }}
          >
            <div style={{ padding: '3px 0' }}>
              <CustomLink
                key={rows[virtualRow.index].id}
                href={{
                  pathname: getCardHref(rows[virtualRow.index], mode),
                  query: { token },
                }}
                style={{ width: 'fit-content' }}
              >
                <DragDropHandler
                  key={rows[virtualRow.index].id}
                  accept={'taskCard'}
                  index={virtualRow.index}
                  task={rows[virtualRow.index]}
                  draggable
                >
                  <Box>
                    <TaskCard
                      task={rows[virtualRow.index]}
                      key={rows[virtualRow.index].id}
                      href={{
                        pathname: getCardHref(rows[virtualRow.index], mode),
                        query: { token },
                      }}
                      workflowState={workflowState}
                      mode={mode}
                      subtasks={showSubtasks ? (subtasksByTaskId[rows[virtualRow.index].id] ?? []) : []}
                    />
                  </Box>
                </DragDropHandler>
              </CustomLink>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TasksColumnVirtualizer({ rows, mode, list }: TasksVirtualizerProps & { list: WorkflowStateResponse }) {
  const { showSubtasks, accessibleTasks } = useSelector(selectTaskBoard)

  const parentRef = useRef<HTMLDivElement>(null)
  const columnVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 100,
  })
  const subtasksByTaskId = useMemo(() => {
    if (!showSubtasks) return {}
    const grouped: Record<string, TaskResponse[]> = {}

    accessibleTasks.forEach((item) => {
      if (!item.parentId) return
      if (!grouped[item.parentId]) grouped[item.parentId] = []
      grouped[item.parentId].push(item)
    })

    Object.keys(grouped).forEach((id) => {
      grouped[id] = sortTaskByDescendingOrder<TaskResponse>(grouped[id])
    })

    return grouped
  }, [accessibleTasks, showSubtasks])

  return (
    <div
      ref={parentRef}
      className="List"
      style={{
        maxHeight: `100vh`,
        width: '100%',
        overflow: 'auto',
        columnGap: '6px',
      }}
    >
      <div
        style={{
          height: `${columnVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {columnVirtualizer.getVirtualItems().map((virtualRow) => {
          const subtasks = showSubtasks ? (subtasksByTaskId[rows[virtualRow.index].id] ?? []) : []
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={(node) => columnVirtualizer.measureElement(node)}
              style={{
                display: 'flex',
                position: 'absolute',
                transform: `translateY(${virtualRow.start}px)`,
                width: '100%',
              }}
            >
              <div style={{ padding: '3px 0', width: '100%' }}>
                <>
                  <DragDropHandler
                    key={rows[virtualRow.index].id}
                    accept={'taskCard'}
                    index={virtualRow.index}
                    task={rows[virtualRow.index]}
                    draggable
                  >
                    <TaskCardList
                      task={rows[virtualRow.index]}
                      variant="task"
                      key={rows[virtualRow.index].id}
                      workflowState={list}
                      mode={mode}
                    />
                  </DragDropHandler>

                  {showSubtasks &&
                    subtasks?.length > 0 &&
                    subtasks.map((subtask) => {
                      return (
                        <TaskCardList
                          task={subtask}
                          variant="subtask"
                          key={subtask.id}
                          mode={mode}
                          sx={{
                            padding: { xs: '10px 12px 10px 34px', sm: '10px 20px 10px 44px' },
                            height: '44px',
                          }}
                        />
                      )
                    })}
                </>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
