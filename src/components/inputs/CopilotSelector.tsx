import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import 'copilot-design-system/dist/styles/main.css'
import { UserCompanySelector, InputValue } from 'copilot-design-system'

export const CopilotSelector = ({ onChange }: { onChange: (inputValue: InputValue[]) => void }) => {
  const { selectorAssignee } = useSelector(selectTaskBoard)
  return (
    <>
      <UserCompanySelector
        clientUsers={selectorAssignee.clients}
        name="Assignee"
        internalUsers={selectorAssignee.internalUsers}
        companies={selectorAssignee.companies}
        onChange={onChange}
        grouped={true}
      />
    </>
  )
}
