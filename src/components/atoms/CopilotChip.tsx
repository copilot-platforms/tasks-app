import { Chip, IconType } from 'copilot-design-system'

export interface CopilotChipProps {
  label: string
  className?: string
  prefixIcon?: IconType | Exclude<React.ReactNode, string>
  onClick?: (event: React.KeyboardEvent | React.MouseEvent) => void
  onClose?: (event: React.KeyboardEvent | React.MouseEvent | React.TouchEvent) => void
}

export const CopilotChip = ({ label, className, prefixIcon, onClick, onClose }: CopilotChipProps) => {
  return <Chip label={label} className={className} prefixIcon={prefixIcon} onClick={onClick} onClose={onClose} />
}
