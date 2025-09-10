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
import { useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'

interface TasksVirtualizerProps {
  rows: TaskResponse[]
  mode: UserRole
  token: string | null
  subtasksByTaskId: Record<string, TaskResponse[]>
  workflowState?: WorkflowStateResponse
}

// virtualization component used in board view
export function TasksRowVirtualizer({ rows, mode, token, subtasksByTaskId, workflowState }: TasksVirtualizerProps) {
  const { showSubtasks } = useSelector(selectTaskBoard)
  const parentRef = useRef<HTMLDivElement>(null)

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

export function TasksColumnVirtualizer({
  rows,
  mode,
  list,
  subtasksByTaskId,
}: TasksVirtualizerProps & { list: WorkflowStateResponse }) {
  const { showSubtasks } = useSelector(selectTaskBoard)
  const parentRef = useRef<HTMLDivElement>(null)
  const columnVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 100,
  })
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
                  </DragDropHandler>
                </>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
