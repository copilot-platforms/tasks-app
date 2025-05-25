import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import 'copilot-design-system/dist/styles/main.css'
import { StyledUserCompanySelector } from '@/app/detail/ui/styledComponent'

export const CopilotSelector = () => {
  const { selectorAssignee } = useSelector(selectTaskBoard)
  return (
    <>
      <StyledUserCompanySelector
        clientUsers={selectorAssignee.clients}
        name="Assignee"
        internalUsers={selectorAssignee.internalUsers}
        companies={selectorAssignee.companies}
        onChange={(inputValue) => {
          console.log(inputValue)
        }}
        grouped={true}
      />
    </>
  )
}
