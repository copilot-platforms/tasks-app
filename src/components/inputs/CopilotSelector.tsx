import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import 'copilot-design-system/dist/styles/main.css'
import { UserCompanySelector, InputValue } from 'copilot-design-system'

export const CopilotSelector = ({ onChange, name }: { onChange: (inputValue: InputValue[]) => void; name: string }) => {
  const { selectorAssignee } = useSelector(selectTaskBoard)
  return (
    <>
      <UserCompanySelector
        clientUsers={selectorAssignee.clients}
        name={name}
        internalUsers={selectorAssignee.internalUsers}
        companies={selectorAssignee.companies}
        onChange={onChange}
        grouped={true}
      />
    </>
  )
}
