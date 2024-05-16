import {
  AviIcon,
  CsvIcon,
  DocIcon,
  DoneIcon,
  InprogressIcon,
  XlxIcon,
  InreviewIcon,
  JpgIcon,
  MovIcon,
  Mp4Icon,
  PdfIcon,
  PngIcon,
  SvgIcon,
  TodoIcon,
  ZipIcon,
  IsoIcon,
  TxtIcon,
  GifIcon,
  Mp3Icon,
} from '@/icons'
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
  'image/png': <PngIcon />,
  'application/pdf': <PdfIcon />,
  'image/svg+xml': <SvgIcon />,
  'text/csv': <CsvIcon />,
  'application/zip': <ZipIcon />,
  'application/msword': <DocIcon />,
  'video/vnd.avi': <AviIcon />,
  'image/jpeg': <JpgIcon />,
  'video/quicktime': <MovIcon />,
  'video/mp4': <Mp4Icon />,
  'application/vnd.ms-excel': <XlxIcon />,
  'application/vnd.efi.iso': <IsoIcon />,
  'text/plain': <TxtIcon />,
  'image/gif': <GifIcon />,
  'audio/mpeg': <Mp3Icon />,
}
