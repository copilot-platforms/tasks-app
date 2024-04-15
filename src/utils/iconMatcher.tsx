import { DoneIcon, InprogressIcon, InreviewIcon, PdfIcon, PngIcon, TodoIcon } from '@/icons'
import { ReactNode } from 'react'

type StatusKey = 'Todo' | 'In Progress' | 'In Review' | 'Done'

//This is mock data which will be replaced after API integration.
export const statusIcons: { [key in StatusKey]: ReactNode } = {
  Todo: <TodoIcon />,
  'In Progress': <InprogressIcon />,
  'In Review': <InreviewIcon />,
  Done: <DoneIcon />,
}

export const attachmentIcons: { [key: string]: ReactNode } = {
  png: <PngIcon />,
  pdf: <PdfIcon />,
}
