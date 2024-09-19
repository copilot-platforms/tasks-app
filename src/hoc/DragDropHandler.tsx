'use client'

import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { View } from '@/types/interfaces'
import { ReactNode, useEffect, useRef } from 'react'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import { useSelector } from 'react-redux'

interface Prop {
  children: ReactNode
  accept: string
  index: number
  id?: string //only pass for droppable
  task?: TaskResponse //only pass for draggable
  moveCard?: (dragIndex: number, hoverIndex: number, sourceId: number, targetId: number) => void
  onDropItem?: (payload: { taskId: string; targetWorkflowStateId: string }) => void
  draggable?: boolean // Indicates if the item should be draggable
  droppable?: boolean // Indicates if the item should be droppable
}

export const DragDropHandler = ({
  children,
  accept,
  id,
  task,
  onDropItem,
  draggable = false,
  droppable = false, // New prop for droppable
}: Prop) => {
  const { view } = useSelector(selectTaskBoard)
  const ref = useRef<HTMLDivElement | null>(null)

  const [{ isOver, canDrop }, drop] = useDrop<{ id: string }, unknown, { isOver: boolean; canDrop: boolean }>({
    accept: accept,
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    drop: (item) => {
      if (onDropItem && id) {
        onDropItem({
          taskId: item.id,
          targetWorkflowStateId: id,
        })
      }
    },
    canDrop: () => droppable, // Only allow dropping if the component is droppable
  })

  const [{ opacity }, drag, preview] = useDrag(
    {
      type: accept,
      item: {
        id: task?.id,
      },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
      options: {
        dropEffect: 'move',
      },
      canDrag: () => draggable, // Only allow dragging if the component is draggable
    },
    [task?.id],
  )

  const dropHoverStyles =
    isOver && canDrop
      ? {
          border: '0.5px solid #C9CBCD',
          borderRadius: view === View.BOARD_VIEW ? '4px' : '0px',
          backgroundColor: '#F8F9FB',
        }
      : { border: '0.5px solid transparent' }

  // Set an empty image as the drag preview so that the default preview is not shown
  useEffect(() => {
    if (window) {
      //we only need custom drag preview in the list view
      if (draggable) {
        // preview(new Image()) // This sets an empty drag preview
      }
    }
  }, [preview, draggable])

  if (draggable) {
    drag(drop(ref)) // If draggable, combine drag and drop refs
  } else if (droppable) {
    drop(ref) // If only droppable, just use drop ref
  }

  return (
    <div ref={ref} style={{ opacity, ...dropHoverStyles, padding: droppable && view === View.BOARD_VIEW ? '8px' : '0px' }}>
      {children}
    </div>
  )
}
