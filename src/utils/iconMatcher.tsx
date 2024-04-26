import { DoneIcon, InprogressIcon, InreviewIcon, PdfIcon, PngIcon, TodoIcon } from '@/icons'
import { WorkflowState } from '@/types/dto/workflowStates.dto'
import { ReactNode } from 'react'

export const statusIcons: { [key in WorkflowState]: ReactNode } = {
  backlog: <TodoIcon />,
  unstarted: <TodoIcon />,
  started: <InprogressIcon />,
  completed: <DoneIcon />,
  cancelled: <InreviewIcon />,
}

export const attachmentIcons: { [key: string]: ReactNode } = {
  png: <PngIcon />,
  pdf: <PdfIcon />,
}
