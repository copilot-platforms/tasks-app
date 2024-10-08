import { BackendFactory } from 'dnd-core'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'

const shouldIgnoreTarget = (target: any) => {
  return target.closest('.tiptap') !== null
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
      if (!shouldIgnoreTarget(e.target)) {
        original(e, ...extraArgs)
      }
    }
  })

  return instance
}

export const ModifiedHTML5Backend = (manager: any, context: any) => createModifiedBackend(HTML5Backend, manager, context)

export const ModifiedTouchBackend = (manager: any, context: any) => createModifiedBackend(TouchBackend, manager, context)
