import { Toggle } from 'copilot-design-system'

type CopilotToggleProps = {
  label: string
  onChange: () => void
  checked: boolean
}

export const CopilotToggle = ({ label, onChange, checked }: CopilotToggleProps) => {
  return (
    <div className="copilot-toggle-wrapper">
      <Toggle label={label} onChange={onChange} checked={checked} />
    </div>
  )
}
