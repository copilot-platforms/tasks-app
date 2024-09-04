import { CardDragLayer } from '@/components/cards/CardDragLayer'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { View } from '@/types/interfaces'
import React, { useEffect, useState } from 'react'
import { Draggable, DraggableStateSnapshot, DraggingStyle, Droppable, NotDraggingStyle } from 'react-beautiful-dnd'
import { useSelector } from 'react-redux'

interface DragDropHandlerProps {
  children: React.ReactNode
  droppableId?: string
  draggableId?: string
  index?: number
  draggable?: boolean
  droppable?: boolean
  task?: TaskResponse //only pass for draggable item to show the drag preview
}

export const DragDropHandler: React.FC<DragDropHandlerProps> = ({
  children,
  droppableId,
  draggableId,
  index,
  draggable = false,
  droppable = false,
  task,
}) => {
  const { view } = useSelector(selectTaskBoard)

  return droppable && droppableId ? (
    <Droppable droppableId={droppableId} type="TASK">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            padding: 8,
            border: snapshot.isDraggingOver ? '0.5px solid #212B36' : '0.5px solid transparent',
            borderRadius: 4,
          }}
        >
          {children}
          {/* {provided.placeholder} */}
        </div>
      )}
    </Droppable>
  ) : draggable && draggableId && task ? (
    <Draggable draggableId={draggableId} index={index as number}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...getStyle(provided.draggableProps.style, snapshot),
          }}
        >
          {snapshot.isDragging && view === View.LIST_VIEW ? <CardDragLayer task={task} /> : children}
        </div>
      )}
    </Draggable>
  ) : (
    <div>{children}</div>
  )
}

function getStyle(style: NotDraggingStyle | DraggingStyle | undefined, snapshot: DraggableStateSnapshot) {
  if (!snapshot.isDragging) return {}
  if (!snapshot.isDropAnimating) {
    return style
  }

  return {
    ...style,
    // cannot be 0, but make it super tiny
    // this style is used to disable auto reordering of list items
    transitionDuration: `0.001s`,
  }
}
