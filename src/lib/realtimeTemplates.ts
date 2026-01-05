'use client'

import { RealTimeTemplateResponse } from '@/hoc/RealtimeTemplates'
import { selectCreateTemplate, setActiveTemplate, setTemplates } from '@/redux/features/templateSlice'
import store from '@/redux/store'
import { Token } from '@/types/common'
import { AssigneeType, IAssigneeCombined } from '@/types/interfaces'
import { getFormattedTemplate } from '@/utils/getFormattedRealTimeData'
import { extractImgSrcs, replaceImgSrcs } from '@/utils/signedUrlReplacer'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export class RealtimeTemplatesHandler {
  constructor(
    private readonly payload: RealtimePostgresChangesPayload<RealTimeTemplateResponse>,
    private readonly redirectToTemplateBoard: (newTemplate: RealTimeTemplateResponse) => void,
    private readonly tokenPayload: Token,
  ) {
    const newTemplate = getFormattedTemplate(this.payload.new)
    if (newTemplate.workspaceId !== this.tokenPayload.workspaceId) {
      console.error('Realtime event ignored for template with different workspaceId')
      return
    }
  }

  handleRealtimeTemplateInsert() {
    const currentState = store.getState()
    const { templates } = selectCreateTemplate(currentState)
    const newTemplate = getFormattedTemplate(this.payload.new)

    templates
      ? store.dispatch(setTemplates([{ ...newTemplate }, ...templates]))
      : store.dispatch(setTemplates([{ ...newTemplate }]))
  }

  handleRealtimeTemplateUpdate() {
    const updatedTemplate = getFormattedTemplate(this.payload.new)
    const currentState = store.getState()
    const { templates, activeTemplate } = selectCreateTemplate(currentState)
    const oldTemplate = templates && templates.find((template) => template.id == updatedTemplate.id)

    //handle template deleted case.
    if (updatedTemplate.deletedAt) {
      const newTemplateArr = templates && templates.filter((el) => el.id !== updatedTemplate.id)
      store.dispatch(setTemplates(newTemplateArr))
      this.redirectToTemplateBoard(updatedTemplate)
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
        this.applySubtemplateToParentTemplate(updatedTemplate)
        return
      }
      const newTemplateArr = [
        updatedTemplate,
        ...(templates?.filter((template) => template.id !== updatedTemplate.id) || []),
      ]
      store.dispatch(setTemplates(newTemplateArr))
    }
  }

  handleRealtimeSubTemplates() {
    if (this.payload.eventType === 'INSERT') {
      const newTemplate = getFormattedTemplate(this.payload.new)
      this.applySubtemplateToParentTemplate(newTemplate)
    } else {
      this.handleRealtimeTemplateUpdate()
    }
  }

  private applySubtemplateToParentTemplate(newTemplate: RealTimeTemplateResponse) {
    if (!newTemplate?.parentId) return
    const currentState = store.getState()
    const { templates, activeTemplate } = selectCreateTemplate(currentState)

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
}
