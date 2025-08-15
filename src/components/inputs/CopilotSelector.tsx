import { StyledUserCompanySelector } from '@/app/detail/ui/styledComponent'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { IAssigneeCombined, InputValue, ISelectorOption } from '@/types/interfaces'
import { parseAssigneeToSelectorOption } from '@/utils/addTypeToAssignee'
import { parseAssigneeToSelectorOptions } from '@/utils/assignee'
import { getWorkspaceLabels } from '@/utils/getWorkspaceLabels'
import { selectorOptionsToInputValue } from '@/utils/selector'
import { Box, ClickAwayListener, Popper, Stack } from '@mui/material'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { CopilotTooltip, CopilotTooltipProps } from '@/components/atoms/CopilotTooltip'

export const CopilotSelector = ({
  onChange,
  name,
  initialAssignee,
  hideClientsList,
  hideIusList,
}: {
  onChange: (inputValue: InputValue[]) => void
  name: string
  initialAssignee?: ISelectorOption[]
  hideClientsList?: boolean
  hideIusList?: boolean
}) => {
  const { assignee } = useSelector(selectTaskBoard)
  const { workspace } = useSelector(selectAuthDetails)

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
        menuIsOpen={true}
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
        customLabels={getWorkspaceLabels(workspace, true)}
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
  tooltipProps?: Omit<CopilotTooltipProps, 'children'>
  variant?: 'icon' | 'normal'
}

export const CopilotPopSelector = ({
  buttonContent,
  disabled = false,
  name,
  onChange,
  initialValue,
  hideClientsList,
  hideIusList,
  tooltipProps,
  variant = 'normal',
}: CopilotPopSelectorProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const shouldCallOnChangeWithEmpty = useRef(false)

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled) {
        setAnchorEl(anchorEl ? null : event.currentTarget)
      }
    },
    [anchorEl, disabled],
  )

  const initialAssignee = initialValue && parseAssigneeToSelectorOptions(initialValue)
  const [selectedAssignee, setSelectedAssignee] = useState<InputValue[] | undefined>(
    initialAssignee && selectorOptionsToInputValue(initialAssignee),
  )

  const handleClose = useCallback(() => {
    if (shouldCallOnChangeWithEmpty.current && selectedAssignee && !selectedAssignee.length) {
      onChange(selectedAssignee)
      shouldCallOnChangeWithEmpty.current = false
    }
    setAnchorEl(null)
  }, [onChange, selectedAssignee])

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
    <ClickAwayListener
      onClickAway={() => {
        if (open) {
          shouldCallOnChangeWithEmpty.current = true
          handleClose()
        }
      }}
    >
      <Stack direction="column">
        <Box
          onClickCapture={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleClick(e)
          }}
        >
          <CopilotTooltip
            content={tooltipProps?.content ?? 'Change Assignee'}
            disabled={tooltipProps?.disabled || variant == 'normal'}
            placement={tooltipProps?.placement}
            position={tooltipProps?.position}
          >
            <>{buttonContent}</>
          </CopilotTooltip>
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
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <CopilotSelector
            hideClientsList={hideClientsList}
            hideIusList={hideIusList}
            initialAssignee={initialAssignee}
            name={name}
            onChange={(inputValue) => {
              setSelectedAssignee(inputValue)
              if (inputValue.length) {
                onChange(inputValue)
                setAnchorEl(null)
              } else {
                shouldCallOnChangeWithEmpty.current = true
              }
            }}
          />
        </Popper>
      </Stack>
    </ClickAwayListener>
  )
}
