'use client'

import { ReactNode, useRef } from 'react'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'

interface Prop {
  children: ReactNode
  accept: string
  index: number
  id: string
  moveCard?: (dragIndex: number, hoverIndex: number, sourceId: number, targetId: number) => void
  onDropItem?: (payload: { taskId: string; targetWorkflowStateId: string }) => void
  draggable?: boolean // Add this prop
}

export const DragDropHandler = ({ children, accept, index, id, moveCard, onDropItem, draggable = false }: Prop) => {
  const ref = useRef<HTMLDivElement | null>(null)

  const [, drop] = useDrop({
    accept: accept,
    collect(monitor: DropTargetMonitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    drop: (item: unknown, monitor) => {
      if (onDropItem) {
        onDropItem({
          taskId: (item as { taskId: string }).taskId,
          targetWorkflowStateId: id,
        })
      }
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: accept,
    item: () => {
      return { taskId: id }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0.5 : 1

  if (draggable) {
    drag(drop(ref))
  } else {
    drop(ref)
  }

  return (
    <div ref={ref} style={{ opacity }}>
      {children}
    </div>
  )
}
