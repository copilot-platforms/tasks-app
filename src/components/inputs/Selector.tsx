import { Avatar, Box, Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '../buttons/SecondaryBtn'
import { StyledAutocomplete } from './Autocomplete'
import { statusIcons } from '@/utils/iconMatcher'
import { useFocusableInput } from '@/hooks/useFocusableInput'
import { HTMLAttributes, ReactNode, useState } from 'react'
import { StyledTextField } from './TextField'

interface IAssignee {
  name: string
  type: string
  img?: string
}

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
  isOpen: boolean
  handleClick: () => void
  buttonContent: ReactNode
}

export default function Selector({
  getSelectedValue,
  startIcon,
  value,
  selectorType,
  options,
  isOpen,
  handleClick,
  buttonContent,
}: Prop) {
  const [inputStatusValue, setInputStatusValue] = useState('')

  const setSelectorRef = useFocusableInput(isOpen)

  console.log('value', value)

  return (
    <Stack direction="column">
      <SecondaryBtn
        startIcon={startIcon}
        buttonContent={buttonContent}
        handleClick={() => {
          // setDisplayAssignee(false)
          handleClick()
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 35,
          width: '180px',
          display: isOpen ? 'block' : 'none',
        }}
      >
        <StyledAutocomplete
          id="status-box"
          openOnFocus
          options={options}
          value={value}
          onChange={(_, newValue: unknown) => {
            getSelectedValue(newValue)
            handleClick()
          }}
          getOptionLabel={(option: unknown) => {
            if (selectorType === SelectorType.ASSIGNEE_SELECTOR) {
              return (option as IAssignee).name as string
            } else return option as string
          }}
          groupBy={(option: unknown) => {
            if (selectorType === SelectorType.ASSIGNEE_SELECTOR) {
              return (option as IAssignee).type
            } else {
              return ''
            }
          }}
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
          renderOption={(props, option: unknown) => {
            if (selectorType === SelectorType.ASSIGNEE_SELECTOR)
              return <AssigneeSelectorRenderer props={props} option={option} />

            return <StatusSelectorRenderer props={props} option={option} />
          }}
        />
      </Box>
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
        <Box>{statusIcons[option as string]}</Box>
        <Typography variant="sm" fontWeight={400}>
          {option as string}
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
        <Avatar alt="user" src={(option as IAssignee).img} sx={{ width: '20px', height: '20px' }} />
        <Typography variant="sm" fontWeight={400}>
          {(option as IAssignee).name}
        </Typography>
      </Stack>
    </Box>
  )
}
