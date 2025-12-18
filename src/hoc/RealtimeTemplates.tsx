'use client'

import { supabase } from '@/lib/supabase'
import { selectCreateTemplate, setActiveTemplate, setTemplates } from '@/redux/features/templateSlice'
import store from '@/redux/store'
import { Token } from '@/types/common'
import { ITemplate } from '@/types/interfaces'
import { getFormattedTemplate } from '@/utils/getFormattedRealTimeData'
import { isTemplatePayloadEqual } from '@/utils/isRealtimePayloadEqual'
import { extractImgSrcs, replaceImgSrcs } from '@/utils/signedUrlReplacer'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'

export interface RealTimeTemplateResponse extends ITemplate {
  deletedAt: string
}

export const RealTimeTemplates = ({
  children,
  task,
  tokenPayload,
  token,
}: {
  children: ReactNode
  task?: ITemplate
  tokenPayload: Token
  token: string
}) => {
  const { templates = [], activeTemplate } = useSelector(selectCreateTemplate)

  const pathname = usePathname()
  const router = useRouter()

  const applySubtemplateToParentTemplate = (newTemplate: RealTimeTemplateResponse) => {
    if (!newTemplate?.parentId) return

    if (activeTemplate?.id === newTemplate.parentId) {
      store.dispatch(
        setActiveTemplate({
          ...activeTemplate,
          subTaskTemplates: [...(activeTemplate.subTaskTemplates || []), newTemplate],
        }),
      )
    }

    store.dispatch(
      setTemplates(
        templates.map((template) =>
          template.id === newTemplate.parentId
            ? {
                ...template,
                subTaskTemplates: [...(template.subTaskTemplates || []), newTemplate],
              }
            : template,
        ),
      ),
    ) //also append the subTaskTemplates to parent template on the templates store.
  }

  const redirectBack = (updatedTemplate: RealTimeTemplateResponse) => {
    //disable board navigation if not in template details page
    if (!pathname.includes(`manage-templates/${updatedTemplate.id}`)) return

    router.push(
      updatedTemplate?.parentId
        ? `/manage-templates/${updatedTemplate.parentId}?token=${token}`
        : `/manage-templates?token=${token}`,
    )
  }

  const handleTemplatesRealTimeUpdates = (payload: RealtimePostgresChangesPayload<RealTimeTemplateResponse>) => {
    if (isTemplatePayloadEqual(payload)) {
      return //no changes for the same payload
    }
    if (payload.eventType === 'INSERT') {
      const newTemplate = getFormattedTemplate(payload.new)
      let canUserAccessTask = newTemplate.workspaceId === tokenPayload.workspaceId
      if (!canUserAccessTask) return
      if (newTemplate?.parentId) {
        applySubtemplateToParentTemplate(newTemplate)
        return
      }
      templates
        ? store.dispatch(setTemplates([{ ...newTemplate }, ...templates]))
        : store.dispatch(setTemplates([{ ...newTemplate }]))
    }
    if (payload.eventType === 'UPDATE') {
      const updatedTemplate = getFormattedTemplate(payload.new)

      const oldTemplate = templates && templates.find((template) => template.id == updatedTemplate.id)
      if (payload.new.workspaceId === tokenPayload.workspaceId) {
        if (updatedTemplate.deletedAt) {
          const newTemplateArr = templates && templates.filter((el) => el.id !== updatedTemplate.id)
          store.dispatch(setTemplates(newTemplateArr))
          redirectBack(updatedTemplate)
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
          if (activeTemplate?.id == updatedTemplate.id) {
            store.dispatch(
              setActiveTemplate({
                ...updatedTemplate,
                subTaskTemplates: activeTemplate.subTaskTemplates,
              }),
            )
          }
          if (updatedTemplate?.parentId) {
            applySubtemplateToParentTemplate(updatedTemplate)
            return
          }
          const newTemplateArr = [
            updatedTemplate,
            ...(templates?.filter((template) => template.id !== updatedTemplate.id) || []),
          ]
          store.dispatch(setTemplates(newTemplateArr))
        }
      }
    }
  }

  useEffect(() => {
    if (!tokenPayload.internalUserId) {
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
          filter: `workspaceId=eq.${tokenPayload.workspaceId}`,
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
