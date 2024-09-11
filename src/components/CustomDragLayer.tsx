import { useDragLayer, XYCoord } from 'react-dnd'
import React, { cloneElement, ReactElement } from 'react'

interface DragLayerProps {
  currentOffset: XYCoord | null
  item: unknown
}

export const CustomDragLayer = <T extends DragLayerProps>({
  children,
}: {
  children: ReactElement<T> | ReactElement<T>[]
}) => {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    // itemType: monitor.getItemType(),
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
  }))

  if (!isDragging) {
    return null
  }

  return (
    <div style={{ position: 'fixed', pointerEvents: 'none', zIndex: 100, left: 0, top: 0 }}>
      {React.isValidElement(children) ? cloneElement(children, { currentOffset, item } as T) : children}
    </div>
  )
}
