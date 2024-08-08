export const fetchCache = 'force-no-store'

import { DndWrapper } from '@/hoc/DndWrapper'
import { TaskBoard } from './ui/TaskBoard'
import { z } from 'zod'
import ClientError from '@/components/clientError'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { createMultipleAttachments, getSignedUrlUpload } from '@/app/actions'
import { ModalNewTaskForm } from './ui/Modal_NewTaskForm'
import { redirectIfTaskCta } from '@/utils/redirect'

export default async function Main({ searchParams }: { searchParams: { token: string; taskId?: string } }) {
  const token = searchParams.token

  const parsedToken = z.string().safeParse(searchParams.token)
  if (!parsedToken.success) {
    return <ClientError message={'Please provide a Valid Token'} />
  }

  redirectIfTaskCta(searchParams)

  return (
    <>
      <DndWrapper>
        <TaskBoard />
      </DndWrapper>

      <ModalNewTaskForm
        getSignedUrlUpload={async (fileName: string) => {
          'use server'
          return await getSignedUrlUpload(token, fileName)
        }}
        handleCreateMultipleAttachments={async (attachments: CreateAttachmentRequest[]) => {
          'use server'
          await createMultipleAttachments(token, attachments)
        }}
      />
    </>
  )
}
