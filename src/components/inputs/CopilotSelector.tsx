import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { Box, Popper, Stack } from '@mui/material'
import { InputValue, UserCompanySelector } from 'copilot-design-system'
import 'copilot-design-system/dist/styles/main.css'
import { ReactNode, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

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

interface CopilotPopSelectorProps {
  buttonContent?: ReactNode
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
      if (e.key === 'Escape') {
        setAnchorEl(null)
      }
    }

    window.addEventListener('keydown', closePopper)

    return () => {
      window.removeEventListener('keydown', closePopper)
    }
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      setAnchorEl(null)
    }
  }
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
          width: 'fit-content',
        }}
        placement="bottom-start"
      >
        <Box onKeyDown={handleKeyDown}>
          <CopilotSelector
            name={name}
            onChange={(inputValue) => {
              onChange(inputValue)
              setAnchorEl(null)
            }}
          />
        </Box>
      </Popper>
    </Stack>
  )
}
