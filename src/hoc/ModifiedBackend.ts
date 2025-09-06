import { BackendFactory } from 'dnd-core'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'

const shouldIgnoreTarget = (target: any) => {
  if (target?.closest) {
    return target?.closest('.tiptap') !== null
  }
  return false
}

const createModifiedBackend = (Backend: BackendFactory, manager?: any, context?: any) => {
  const instance = Backend(manager, context)

  const listeners = [
    'handleTopDragStart',
    'handleTopDragStartCapture',
    'handleTopDragEndCapture',
    'handleTopDragEnter',
    'handleTopDragEnterCapture',
    'handleTopDragLeaveCapture',
    'handleTopDragOver',
    'handleTopDragOverCapture',
    'handleTopDrop',
    'handleTopDropCapture',
  ]

  listeners.forEach((name) => {
    const original = (instance as any)[name]
    ;(instance as any)[name] = (e: DragEvent | TouchEvent, ...extraArgs: any[]) => {
      const isDragEndEvent = name.includes('DragEnd')
      if (isDragEndEvent || !shouldIgnoreTarget(e.target)) {
        original.call(instance, e, ...extraArgs)
      }
    }
  })
  return instance
}

export const ModifiedHTML5Backend = (manager: any, context: any) => createModifiedBackend(HTML5Backend, manager, context)

export const ModifiedTouchBackend = (manager: any, context: any) => createModifiedBackend(TouchBackend, manager, context)
