'use client'

import { supabase } from '@/lib/supabase'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { selectCreateTemplate, setTemplates } from '@/redux/features/templateSlice'
import store from '@/redux/store'
import { Token } from '@/types/common'
import { ITemplate } from '@/types/interfaces'
import { extractImgSrcs, replaceImgSrcs } from '@/utils/signedUrlReplacer'
import { AssigneeType, TaskTemplate } from '@prisma/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'

interface RealTimeTemplateResponse extends ITemplate {
  deletedAt: string
}

export const RealTimeTemplates = ({
  children,
  task,
  tokenPayload,
}: {
  children: ReactNode
  task?: ITemplate
  tokenPayload: Token
}) => {
  const { templates } = useSelector(selectCreateTemplate)
  const { token } = useSelector(selectTaskBoard)

  const userId = tokenPayload?.internalUserId || tokenPayload?.clientId
  const userRole = tokenPayload?.internalUserId
    ? AssigneeType.internalUser
    : tokenPayload?.clientId
      ? AssigneeType.client
      : undefined

  if (!userId || !userRole) {
    console.error(`Failed to authenticate a realtime connection for id ${userId} with role ${userRole}`)
  }

  const handleTemplatesRealTimeUpdates = (payload: RealtimePostgresChangesPayload<RealTimeTemplateResponse>) => {
    if (payload.eventType === 'INSERT') {
      let canUserAccessTask = payload.new.workspaceId === tokenPayload?.workspaceId
      if (userRole === AssigneeType.client) {
        canUserAccessTask = false
      }
      if (canUserAccessTask) {
        templates
          ? store.dispatch(
              setTemplates([...templates, { ...payload.new, createdAt: new Date(payload.new.createdAt + 'Z') }]),
            )
          : store.dispatch(setTemplates([{ ...payload.new, createdAt: new Date(payload.new.createdAt + 'Z') }]))
      }
    }
    if (payload.eventType === 'UPDATE') {
      console.log('updating', payload.new)
      const updatedTemplate = payload.new
      const isCreatedAtGMT = (updatedTemplate.createdAt as unknown as string).slice(-1).toLowerCase() === 'z'
      if (!isCreatedAtGMT) {
        // DB stores GMT timestamp without 'z', so need to append this manually
        updatedTemplate.createdAt = ((updatedTemplate.createdAt as unknown as string) + 'Z') as unknown as Date
        // This casting is safe
      }
      const oldTemplate = templates && templates.find((template) => (template.id = updatedTemplate.id))
      console.log(oldTemplate)
      if (payload.new.workspaceId === tokenPayload?.workspaceId) {
        console.log('enter 1')
        if (updatedTemplate.deletedAt) {
          const newTemplateArr = templates && templates.filter((el) => el.id !== updatedTemplate.id)
          store.dispatch(setTemplates(newTemplateArr))
        } else {
          // Address Postgres' 8kb pagesize limitation (See TOAST https://www.postgresql.org/docs/current/storage-toast.html)
          // If `body` field (which can be larger than pagesize) is not changed, Supabase Realtime won't send large fields like this in `payload.new`

          // So, we need to check if the oldTask has valid body but new body field is not being sent in updatedTask, and add it if required
          if (oldTemplate?.body && updatedTemplate.body === undefined) {
            updatedTemplate.body = oldTemplate?.body
          }
          if (oldTemplate && oldTemplate.body && updatedTemplate.body) {
            const oldImgSrcs = extractImgSrcs(oldTemplate.body)
            const newImgSrcs = extractImgSrcs(updatedTemplate.body)
            // Need to extract new image Srcs and replace it with old ones, because since we are creating a new url of images on each task details navigation,
            // a second user navigating the task details will generate a new src and replace it in the database which causes the previous user to load the src again(because its new)
            if (oldImgSrcs.length > 0 && newImgSrcs.length > 0) {
              updatedTemplate.body = replaceImgSrcs(updatedTemplate.body, newImgSrcs, oldImgSrcs)
            }
          }
          const newTemplateArr = templates && [
            ...templates.filter((template) => template.id !== updatedTemplate.id),
            updatedTemplate,
          ]
          console.log('enter 2')
          console.log(templates && templates.find((template) => template.id == updatedTemplate.id))
          store.dispatch(setTemplates(newTemplateArr))
        }
      }
    }
    if (payload.eventType === 'DELETE') {
    }
  }

  useEffect(() => {
    if (!userId || !userRole) {
      // Don't try to open a connection with `undefined` parameters
      return
    }
    const channel = supabase
      .channel('realtime templates')
      .on(
        'postgres_changes',
        // Because of the way supabase realtime is architected for postgres_changes, it can only apply one filter at a time.
        // Ref: https://github.com/supabase/realtime-js/issues/97
        {
          event: '*',
          schema: 'public',
          table: 'TaskTemplates',
          filter: userRole === AssigneeType.internalUser ? `workspaceId=eq.${tokenPayload?.workspaceId}` : undefined,
        },
        handleTemplatesRealTimeUpdates,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, templates])

  return children
}
