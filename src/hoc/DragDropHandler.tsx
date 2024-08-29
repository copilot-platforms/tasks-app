'use client'

import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { ViewMode } from '@prisma/client'
import { ReactNode, useEffect, useRef } from 'react'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import { useSelector } from 'react-redux'

interface Prop {
  children: ReactNode
  accept: string
  index: number
  id: string
  moveCard?: (dragIndex: number, hoverIndex: number, sourceId: number, targetId: number) => void
  onDropItem?: (payload: { taskId: string; targetWorkflowStateId: string }) => void
  draggable?: boolean // Indicates if the item should be draggable
  droppable?: boolean // Indicates if the item should be droppable
}

export const DragDropHandler = ({
  children,
  accept,
  index,
  id,
  moveCard,
  onDropItem,
  draggable = false,
  droppable = false, // New prop for droppable
}: Prop) => {
  const { view } = useSelector(selectTaskBoard)
  const ref = useRef<HTMLDivElement | null>(null)

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: accept,
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    drop: (item: unknown, monitor) => {
      if (onDropItem) {
        onDropItem({
          taskId: (item as { taskId: string }).taskId,
          targetWorkflowStateId: id,
        })
      }
    },
    canDrop: () => droppable, // Only allow dropping if the component is droppable
  })

  const [{ isDragging }, drag, preview] = useDrag({
    type: accept,
    item: () => {
      return { taskId: id }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => draggable, // Only allow dragging if the component is draggable
  })

  // Set an empty image as the drag preview so that the default preview is not shown
  useEffect(() => {
    if (window) {
      //we only need custom drag preview in the list view
      if (draggable && view === ViewMode.list) {
        preview(new Image()) // This sets an empty drag preview
      }
    }
  }, [preview, draggable])

  const opacity = isDragging ? 0.5 : 1
  const dropHoverStyles =
    isOver && canDrop
      ? {
          border: '0.5px solid #212B36',
          borderRadius: '4px',
        }
      : {}

  if (draggable) {
    drag(drop(ref)) // If draggable, combine drag and drop refs
  } else if (droppable) {
    drop(ref) // If only droppable, just use drop ref
  }

  return (
    <div ref={ref} style={{ opacity, ...dropHoverStyles, padding: droppable ? '8px' : '0px' }}>
      {children}
    </div>
  )
}
