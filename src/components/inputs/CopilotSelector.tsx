import { StyledUserCompanySelector } from '@/app/detail/ui/styledComponent'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { IAssigneeCombined, InputValue } from '@/types/interfaces'
import { parseAssigneeToSelectorOption } from '@/utils/addTypeToAssignee'
import { parseAssigneeToSelectorOptions } from '@/utils/assignee'
import { selectorOptionsToInputValue } from '@/utils/selector'
import { Box, ClickAwayListener, Popper, Stack } from '@mui/material'
import { ReactNode, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export const CopilotSelector = ({
  onChange,
  name,
  initialValue,
  hideClientsList,
  hideIusList,
}: {
  onChange: (inputValue: InputValue[]) => void
  name: string
  initialValue?: IAssigneeCombined
  hideClientsList?: boolean
  hideIusList?: boolean
}) => {
  const { assignee } = useSelector(selectTaskBoard)
  const initialAssignee = initialValue && parseAssigneeToSelectorOptions(initialValue)
  // Currently selected assignee. This is not guarenteed to be the same as the final assignee
  // and is just the temporary state while the selector is still open
  const [currentlySelected, setCurrentlySelected] = useState<InputValue[]>(
    initialAssignee ? selectorOptionsToInputValue(initialAssignee) : [],
  )

  const selectorAssignee = parseAssigneeToSelectorOption(assignee)

  return (
    <>
      <StyledUserCompanySelector
        openMenuOnFocus
        autoFocus
        placeholder={'Set assignee'}
        initialValue={initialAssignee}
        clientUsers={hideClientsList ? [] : selectorAssignee.clients}
        name={name}
        internalUsers={hideIusList ? [] : selectorAssignee.internalUsers}
        companies={hideClientsList ? [] : selectorAssignee.companies}
        onChange={(inputValue: InputValue[]) => {
          setCurrentlySelected(inputValue)
          onChange(inputValue)
        }}
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
  initialValue?: IAssigneeCombined
  hideClientsList?: boolean
  hideIusList?: boolean
}

export const CopilotPopSelector = ({
  buttonContent,
  disabled = false,
  name,
  onChange,
  initialValue,
  hideClientsList,
  hideIusList,
}: CopilotPopSelectorProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      setAnchorEl(anchorEl ? null : event.currentTarget)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
  }
  const open = Boolean(anchorEl)
  const id = open ? 'selector-popper' : ''

  useEffect(() => {
    function closePopper(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        e.stopPropagation()
        handleClose()
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
    <ClickAwayListener onClickAway={handleClose}>
      <Stack direction="column">
        <Box onClick={handleClick}>{buttonContent}</Box>
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
            hideClientsList={hideClientsList}
            hideIusList={hideIusList}
            initialValue={initialValue}
            name={name}
            onChange={(inputValue) => {
              onChange(inputValue)
              setAnchorEl(null)
            }}
          />
        </Popper>
      </Stack>
    </ClickAwayListener>
  )
}
