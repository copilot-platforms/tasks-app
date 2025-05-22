import { SelectorType } from '@/components/inputs/Selector'
import { setCreateTaskFields } from '@/redux/features/createTaskSlice'
import { setCreateTemplateFields } from '@/redux/features/templateSlice'
import store from '@/redux/store'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssigneeCombined, HandleSelectorComponentModes, IUserIds, UserIds } from '@/types/interfaces'
import { userIdFieldMap } from '@/types/objectMaps'
import { getAssigneeTypeCorrected } from '@/utils/getAssigneeTypeCorrected'
import { useEffect, useState } from 'react'

export const useHandleSelectorComponent = ({
  item,
  type,
  mode,
}: {
  item: unknown
  type: SelectorType
  mode?: HandleSelectorComponentModes
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

    if (mode === HandleSelectorComponentModes.CreateTaskFieldUpdate && type === SelectorType.ASSIGNEE_SELECTOR) {
      const activeKey = userIdFieldMap[(item as IAssigneeCombined).type as keyof typeof userIdFieldMap]
      const newUserIds: IUserIds = {
        [UserIds.INTERNAL_USER_ID]: null,
        [UserIds.CLIENT_ID]: null,
        [UserIds.COMPANY_ID]: null,
        [activeKey]: (item as IAssigneeCombined).id,
      }
      if ((item as IAssigneeCombined).type === 'clients' && (item as IAssigneeCombined).companyId) {
        newUserIds[UserIds.COMPANY_ID] = (item as IAssigneeCombined).companyId ?? null
      } //set companyId if clientId is selected

      store.dispatch(setCreateTaskFields({ targetField: 'userIds', value: newUserIds }))

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
