import { StyledUserCompanySelector } from '@/app/detail/ui/styledComponent'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { InputValue } from '@/types/interfaces'
import { Box, Popper, Stack } from '@mui/material'

import 'copilot-design-system/dist/styles/main.css'
import { ReactNode, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export const CopilotSelector = ({ onChange, name }: { onChange: (inputValue: InputValue[]) => void; name: string }) => {
  const { selectorAssignee } = useSelector(selectTaskBoard)
  return (
    <>
      <StyledUserCompanySelector
        clientUsers={selectorAssignee.clients}
        name={name}
        internalUsers={selectorAssignee.internalUsers}
        companies={selectorAssignee.companies}
        onChange={onChange}
        grouped={true}
        limitSelectedOptions={1}
      />
    </>
  )
}

interface CopilotPopSelectorProps {
  buttonContent: ReactNode
  disabled?: boolean
  onClick?: () => void
  name: string
  onChange: (inputValue: InputValue[]) => void
}
export const CopilotPopSelector = ({ buttonContent, disabled = false, name, onChange }: CopilotPopSelectorProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      setAnchorEl(anchorEl ? null : event.currentTarget)
    }
  }
  const open = Boolean(anchorEl)
  const id = open ? 'selector-popper' : ''

  useEffect(() => {
    function closePopper(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        e.stopPropagation()
        setAnchorEl(null)
      }
    }
    if (open) {
      document.addEventListener('keydown', closePopper, true)
    }
    return () => {
      document.removeEventListener('keydown', closePopper, true)
    }
  }, [open])

  return (
    <Stack direction="column">
      <Box onMouseDown={handleClick}>
        <> {buttonContent}</>
      </Box>
      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        sx={{
          zIndex: '1600',
          width: 'fit-content',
        }}
        placement="bottom-start"
      >
        <CopilotSelector
          name={name}
          onChange={(inputValue) => {
            onChange(inputValue)
            setAnchorEl(null)
          }}
        />
      </Popper>
    </Stack>
  )
}
