import { SelectorType } from '@/components/inputs/Selector'
import { setCreateTaskFields } from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
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
      //do this later while integrating assignee
    }
  }, [type])

  return {
    renderingItem,
    updateRenderingItem,
  }
}
