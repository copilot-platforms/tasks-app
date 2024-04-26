import { SelectorType } from '@/components/inputs/Selector'
import { setCreateTaskFields } from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssigneeCombined } from '@/types/interfaces'
import { useEffect, useState } from 'react'

export const useHandleSelectorComponent = ({ item, type }: { item: unknown; type: SelectorType }) => {
  const [renderingItem, setRenderingItem] = useState<unknown>(item)

  const updateRenderingItem = (newValue: unknown) => {
    setRenderingItem(newValue)
  }

  useEffect(() => {
    if (type === SelectorType.STATUS_SELECTOR) {
      store.dispatch(setCreateTaskFields({ targetField: 'workflowStateId', value: (item as WorkflowStateResponse)?.id }))
    }

    if (type === SelectorType.ASSIGNEE_SELECTOR) {
      store.dispatch(setCreateTaskFields({ targetField: 'assigneeId', value: (item as IAssigneeCombined)?.id }))
      const assigneeType = (item as IAssigneeCombined).type
      store.dispatch(
        setCreateTaskFields({
          targetField: 'assigneeType',
          value:
            assigneeType === 'ius'
              ? 'internalUser'
              : assigneeType === 'clients'
                ? 'client'
                : assigneeType === 'companies'
                  ? 'company'
                  : '',
        }),
      )
    }
  }, [type, item])

  return {
    renderingItem,
    updateRenderingItem,
  }
}
