import { cn } from '@/utils/twMerge'
import { Toggle } from 'copilot-design-system'

type CopilotToggleProps = {
  label: string
  onChange: () => void
  checked: boolean
} & React.HTMLAttributes<HTMLDivElement>

export const CopilotToggle = ({ label, onChange, checked, className }: CopilotToggleProps) => {
  return (
    <div className={cn('copilot-toggle-wrapper', className)}>
      <Toggle label={label} onChange={onChange} checked={checked} />
    </div>
  )
}
