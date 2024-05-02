import { Avatar, Box, Popper, Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { StyledAutocomplete } from '@/components/inputs/Autocomplete'
import { statusIcons } from '@/utils/iconMatcher'
import { useFocusableInput } from '@/hooks/useFocusableInput'
import { HTMLAttributes, ReactNode, useState } from 'react'
import { StyledTextField } from './TextField'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssigneeCombined } from '@/types/interfaces'

export enum SelectorType {
  ASSIGNEE_SELECTOR = 'assigneeSelector',
  STATUS_SELECTOR = 'statusSelector',
}

interface Prop {
  getSelectedValue: (value: unknown) => void
  startIcon: ReactNode
  value: unknown
  selectorType: SelectorType.STATUS_SELECTOR | SelectorType.ASSIGNEE_SELECTOR
  options: unknown[]
  buttonContent: ReactNode
}

export default function Selector({ getSelectedValue, startIcon, value, selectorType, options, buttonContent }: Prop) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'autocomplete-popper' : undefined

  const [inputStatusValue, setInputStatusValue] = useState('')

  const setSelectorRef = useFocusableInput(open)

  function detectSelectorType(option: unknown) {
    return selectorType === SelectorType.ASSIGNEE_SELECTOR
      ? ((option as IAssigneeCombined).name as string) || ((option as IAssigneeCombined).givenName as string)
      : ((option as WorkflowStateResponse).name as string)
  }

  return (
    <Stack direction="column">
      <Box onClick={handleClick} aria-describedby={id}>
        <SecondaryBtn startIcon={startIcon} buttonContent={buttonContent} />
      </Box>
      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        sx={{
          width: '180px',
        }}
        placement="bottom-end"
      >
        <StyledAutocomplete
          id="status-box"
          onBlur={() => {
            setAnchorEl(null)
          }}
          openOnFocus
          autoHighlight
          options={options}
          value={value}
          onChange={(_, newValue: unknown) => {
            getSelectedValue(newValue)
            if (newValue) {
              setAnchorEl(null)
            }
          }}
          getOptionLabel={(option: unknown) => detectSelectorType(option)}
          groupBy={(option: unknown) =>
            selectorType === SelectorType.ASSIGNEE_SELECTOR ? (option as IAssigneeCombined).type : ''
          }
          inputValue={inputStatusValue}
          onInputChange={(_, newInputValue) => {
            setInputStatusValue(newInputValue)
          }}
          renderInput={(params) => {
            return (
              <StyledTextField
                {...params}
                variant="outlined"
                inputRef={setSelectorRef}
                placeholder="Change status..."
                borderColor="#EDEDF0"
              />
            )
          }}
          renderOption={(props, option: unknown) =>
            selectorType === SelectorType.ASSIGNEE_SELECTOR ? (
              <AssigneeSelectorRenderer props={props} option={option} />
            ) : (
              <StatusSelectorRenderer props={props} option={option} />
            )
          }
        />
      </Popper>
    </Stack>
  )
}

const StatusSelectorRenderer = ({ props, option }: { props: HTMLAttributes<HTMLLIElement>; option: unknown }) => {
  return (
    <Box
      component="li"
      {...props}
      sx={{
        '&.MuiAutocomplete-option[aria-selected="true"]': {
          bgcolor: (theme) => theme.color.gray[100],
        },
        '&.MuiAutocomplete-option[aria-selected="true"].Mui-focused': {
          bgcolor: (theme) => theme.color.gray[100],
        },
      }}
    >
      <Stack direction="row" alignItems="center" columnGap={3}>
        <Box>{statusIcons[(option as WorkflowStateResponse).type]}</Box>
        <Typography variant="sm" fontWeight={400}>
          {(option as WorkflowStateResponse).name as string}
        </Typography>
      </Stack>
    </Box>
  )
}
const AssigneeSelectorRenderer = ({ props, option }: { props: HTMLAttributes<HTMLLIElement>; option: unknown }) => {
  return (
    <Box
      component="li"
      {...props}
      sx={{
        '&.MuiAutocomplete-option[aria-selected="true"]': {
          bgcolor: (theme) => theme.color.gray[100],
        },
        '&.MuiAutocomplete-option[aria-selected="true"].Mui-focused': {
          bgcolor: (theme) => theme.color.gray[100],
        },
      }}
    >
      <Stack direction="row" alignItems="center" columnGap={3}>
        <Avatar
          alt="user"
          src={(option as IAssigneeCombined).avatarImageUrl || (option as IAssigneeCombined).iconImageUrl}
          sx={{ width: '20px', height: '20px' }}
        />
        <Typography variant="sm" fontWeight={400}>
          {(option as IAssigneeCombined)?.name || (option as IAssigneeCombined)?.givenName}
        </Typography>
      </Stack>
    </Box>
  )
}
