import { SelectorType } from '@/components/inputs/Selector'
import { setCreateTaskFields } from '@/redux/features/createTaskSlice'
import { setCreateTemplateFields } from '@/redux/features/templateSlice'
import store from '@/redux/store'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssigneeCombined } from '@/types/interfaces'
import { getAssigneeTypeCorrected } from '@/utils/getAssigneeTypeCorrected'
import { useEffect, useState } from 'react'

export const useHandleSelectorComponent = ({
  item,
  type,
  createTaskfieldUpdate = false,
}: {
  item: unknown
  type: SelectorType
  createTaskfieldUpdate?: boolean
}) => {
  const [renderingItem, setRenderingItem] = useState<unknown>(item)

  const updateRenderingItem = (newValue: unknown) => {
    setRenderingItem(newValue)
  }

  useEffect(() => {
    //item can be null and we don't want this block to run if item is null, thus we are doing the below check for item
    if (type === SelectorType.STATUS_SELECTOR && item) {
      store.dispatch(setCreateTaskFields({ targetField: 'workflowStateId', value: (item as WorkflowStateResponse)?.id }))
      store.dispatch(setCreateTemplateFields({ targetField: 'workflowStateId', value: (item as WorkflowStateResponse)?.id }))
    }

    if (type === SelectorType.ASSIGNEE_SELECTOR && item && createTaskfieldUpdate) {
      store.dispatch(setCreateTaskFields({ targetField: 'assigneeId', value: (item as IAssigneeCombined)?.id }) ?? null)
      store.dispatch(
        setCreateTaskFields({ targetField: 'assigneeType', value: getAssigneeTypeCorrected(item as IAssigneeCombined) }),
      )
      store.dispatch(
        setCreateTemplateFields({
          targetField: 'assigneeType',
          value: getAssigneeTypeCorrected(item as IAssigneeCombined),
        }),
      )
    }
    setRenderingItem(item)
  }, [type, item])

  return {
    renderingItem,
    updateRenderingItem,
  }
}
