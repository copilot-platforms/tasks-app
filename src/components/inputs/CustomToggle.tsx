import { Toggle } from 'copilot-design-system'

type CustomToggleProps = {
  label: string
  onChange: () => void
  checked: boolean
}

export const CustomToggle = ({ label, onChange, checked }: CustomToggleProps) => {
  return (
    <div className="custom-toggle-wrapper">
      <Toggle label={label} onChange={onChange} checked={checked} />
    </div>
  )
}
