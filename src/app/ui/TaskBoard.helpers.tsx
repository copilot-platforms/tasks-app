import { setActiveWorkflowStateId, setShowModal } from '@/redux/features/createTaskSlice'
import store from '@/redux/store'

export const handleAddBtnClicked = (workflowStateId: string) => {
  store.dispatch(setActiveWorkflowStateId(workflowStateId))
  store.dispatch(setShowModal())
}
