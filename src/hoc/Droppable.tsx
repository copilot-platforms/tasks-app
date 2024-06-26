import { ReactNode } from 'react'
import { useRef } from 'react'
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'

interface IItem {
  id: number
  index: number
}

interface Prop {
  children: ReactNode
  accept: string
  index: number
  id: number
  moveCard?: (dragIndex: number, hoverIndex: number, sourceId: number, targetId: number) => void
  onDropItem?: (item: IItem) => void
}

export const Droppable = ({ children, accept, index, id, moveCard, onDropItem }: Prop) => {
  const ref = useRef<HTMLDivElement | null>(null)

  const [, drop] = useDrop({
    accept: accept,
    collect(monitor: DropTargetMonitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    drop: (item: unknown, monitor) => {
      if (onDropItem && item && typeof item === 'object') {
        const hoverIndex = monitor.getClientOffset()?.y
        if (hoverIndex !== null && ref.current && hoverIndex) {
          onDropItem(item as IItem)
        }
      }
    },
    hover(item: unknown, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return
      }
      if (!moveCard) {
        return
      }
      const dragIndex = (item as IItem).index
      const hoverIndex = index
      const sourceId = (item as IItem).id
      const targetId = id

      if (dragIndex === hoverIndex && sourceId === targetId) {
        return
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset && clientOffset.y - hoverBoundingRect.top
      if (dragIndex < hoverIndex && hoverClientY && hoverClientY < hoverMiddleY) {
        return
      }
      if (dragIndex > hoverIndex && hoverClientY && hoverClientY > hoverMiddleY) {
        return
      }
      moveCard(dragIndex, hoverIndex, sourceId, targetId)
      ;(item as IItem).index = hoverIndex
      ;(item as IItem).id = targetId
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: accept,
    item: () => {
      return { id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0.5 : 1
  drag(drop(ref))

  return (
    <div ref={ref} style={{ opacity: opacity, margin: '6px 0px' }}>
      {children}
    </div>
  )
}
