import React from 'react'
import { DraggableProvided, DraggableStateSnapshot, DraggingStyle, NotDraggingStyle } from 'react-beautiful-dnd'
import { CardDragLayer } from './cards/CardDragLayer'

interface CustomDragLayerProps {
  snapshot: DraggableStateSnapshot
  provided: DraggableProvided
  // style: NotDraggingStyle | DraggingStyle | undefined
  style: any
  children: React.ReactNode
}

export const CustomDragLayer: React.FC<CustomDragLayerProps> = ({ snapshot, provided, style, children }) => {
  const isDragging = snapshot.isDragging
  console.log('djflks', provided.draggableProps.style?.transition)

  return (
    <>
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={{
          ...provided.draggableProps.style,
          visibility: isDragging ? 'hidden' : 'visible',
          ...style,
        }}
      >
        {children}
      </div>
      {isDragging && (
        <div
          style={{
            position: 'fixed',
            top: snapshot.draggingOver ? 0 : 'unset',
            left: snapshot.draggingOver ? 0 : 'unset',
            pointerEvents: 'none',
            zIndex: 1000,
            transform: `translate(${snapshot.draggingOver ? provided.draggableProps.style?.transform : 0}px, ${
              snapshot.draggingOver ? provided.draggableProps.style?.transform : 0
            }px)`,
          }}
        >
          <div style={{ padding: '8px', background: 'lightgrey', borderRadius: '4px' }}>{children}</div>
        </div>
      )}
    </>
  )
}
