import { Avatar, Box, Popper, Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { StyledAutocomplete } from '@/components/inputs/Autocomplete'
import { statusIcons } from '@/utils/iconMatcher'
import { useFocusableInput } from '@/hooks/useFocusableInput'
import { HTMLAttributes, ReactNode, useState } from 'react'
import { StyledTextField } from './TextField'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssigneeCombined, IExtraOption, ITemplate, TruncateMaxNumber } from '@/types/interfaces'
import { truncateText } from '@/utils/truncateText'
import AvatarWithInitials from '@/components/Avatar/AvatarWithInitials'

export enum SelectorType {
  ASSIGNEE_SELECTOR = 'assigneeSelector',
  STATUS_SELECTOR = 'statusSelector',
  TEMPLATE_SELECTOR = 'templateSelected',
}

interface Prop {
  getSelectedValue: (value: unknown) => void
  startIcon: ReactNode
  value: unknown
  selectorType: SelectorType
  options: unknown[]
  buttonContent: ReactNode
  disabled?: boolean
  placeholder?: string
  extraOption?: IExtraOption
  extraOptionRenderer?: (
    setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>,
    anchorEl: null | HTMLElement,
    props?: HTMLAttributes<HTMLLIElement>,
  ) => ReactNode
}

export default function Selector({
  getSelectedValue,
  startIcon,
  value,
  selectorType,
  options,
  buttonContent,
  disabled,
  placeholder = 'Change status...',
  extraOption,
  extraOptionRenderer,
}: Prop) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      setAnchorEl(anchorEl ? null : event.currentTarget)
    }
  }

  const open = Boolean(anchorEl)
  const id = open ? 'autocomplete-popper' : ''

  const [inputStatusValue, setInputStatusValue] = useState('')

  const setSelectorRef = useFocusableInput(open)

  function detectSelectorType(option: unknown) {
    if (selectorType === SelectorType.ASSIGNEE_SELECTOR) {
      return ((option as IAssigneeCombined).name as string) || ((option as IAssigneeCombined).givenName as string)
    }

    if (selectorType === SelectorType.STATUS_SELECTOR) {
      return (option as WorkflowStateResponse).name as string
    } else {
      return ''
    }
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
          width: 'fit-content',
          zIndex: '9999',
        }}
        placement="bottom-start"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 4],
            },
          },
        ]}
      >
        <StyledAutocomplete
          id="status-box"
          onBlur={() => {
            setAnchorEl(null)
          }}
          openOnFocus
          autoHighlight
          options={extraOption ? [extraOption, ...options] : options}
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
                placeholder={placeholder}
                borderColor="#EDEDF0"
                sx={{
                  width: '200px',
                  visibility: { xs: 'none', sm: 'visible' },
                }}
              />
            )
          }}
          renderOption={(props, option: unknown) =>
            extraOption && extraOptionRenderer && (option as IExtraOption)?.extraOptionFlag ? (
              extraOptionRenderer(setAnchorEl, anchorEl, props)
            ) : selectorType === SelectorType.ASSIGNEE_SELECTOR ? (
              <AssigneeSelectorRenderer props={props} option={option} />
            ) : selectorType === SelectorType.STATUS_SELECTOR ? (
              <StatusSelectorRenderer props={props} option={option} />
            ) : selectorType === SelectorType.TEMPLATE_SELECTOR ? (
              <TemplateSelectorRenderer props={props} option={option} />
            ) : (
              <></>
            )
          }
        />
      </Popper>
    </Stack>
  )
}
const TemplateSelectorRenderer = ({ props, option }: { props: HTMLAttributes<HTMLLIElement>; option: unknown }) => {
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
        <Typography variant="sm" fontWeight={400}>
          {(option as ITemplate).templateName as string}
        </Typography>
      </Stack>
    </Box>
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
  const assignee = option as IAssigneeCombined
  return (
    <Box
      component="li"
      {...props}
      sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        '&.MuiAutocomplete-option[aria-selected="true"]': {
          bgcolor: (theme) => theme.color.gray[100],
        },
        '&.MuiAutocomplete-option[aria-selected="true"].Mui-focused': {
          bgcolor: (theme) => theme.color.gray[100],
        },
      }}
    >
      <Stack direction="row" alignItems="center" columnGap={3}>
        <AvatarWithInitials
          altName={assignee?.givenName || assignee?.familyName}
          alt="user"
          src={assignee.avatarImageUrl || assignee.iconImageUrl}
          sx={{ width: '20px', height: '20px' }}
          variant={(option as IAssigneeCombined).type === 'companies' ? 'rounded' : 'circular'}
        />
        <Typography variant="sm" fontWeight={400}>
          {truncateText(
            (option as IAssigneeCombined)?.name ||
              `${(option as IAssigneeCombined)?.givenName ?? ''}  ${(option as IAssigneeCombined)?.familyName ?? ''}`.trim(),
            TruncateMaxNumber.SELECTOR,
          )}
        </Typography>
      </Stack>
    </Box>
  )
}
