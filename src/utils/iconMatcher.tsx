import { DoneIcon, InprogressIcon, InreviewIcon, PdfIcon, PngIcon, TodoIcon } from '@/icons'
import { ReactNode } from 'react'

//This is mock data which will be replaced after API integration.
export const statusIcons: { [key: string]: ReactNode } = {
  Todo: <TodoIcon />,
  'In Progress': <InprogressIcon />,
  'In review': <InreviewIcon />,
  Done: <DoneIcon />,
}

export const attachmentIcons: { [key: string]: ReactNode } = {
  png: <PngIcon />,
  pdf: <PdfIcon />,
}
