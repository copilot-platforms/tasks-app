import { Avatar, Box, Button, Popper, Stack, Typography } from '@mui/material'
import { StyledAutocomplete } from '@/components/inputs/Autocomplete'
import { statusIcons } from '@/utils/iconMatcher'
import { useFocusableInput } from '@/hooks/useFocusableInput'
import { HTMLAttributes, ReactNode, useEffect, useState } from 'react'
import { StyledTextField } from './TextField'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssigneeCombined, IExtraOption, ITemplate, UserType, UserTypesName } from '@/types/interfaces'
import { TruncateMaxNumber } from '@/types/constants'

import { truncateText } from '@/utils/truncateText'

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
  disableOutline?: boolean
  buttonWidth?: string
  responsiveNoHide?: boolean
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
  disableOutline,
  buttonWidth,
  responsiveNoHide,
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
      return truncateText(
        (option as IAssigneeCombined)?.name ||
          `${(option as IAssigneeCombined)?.givenName ?? ''} ${(option as IAssigneeCombined)?.familyName ?? ''}`.trim(),
        TruncateMaxNumber.SELECTOR,
      )
    }

    if (selectorType === SelectorType.STATUS_SELECTOR) {
      return (option as WorkflowStateResponse).name as string
    }
    if (selectorType === SelectorType.TEMPLATE_SELECTOR) {
      return (option as ITemplate).templateName as string
    } else {
      return ''
    }
  }

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

  return (
    <Stack direction="column">
      <Box onClick={handleClick} aria-describedby={id}>
        {disableOutline ? (
          <Stack
            direction="row"
            alignItems="center"
            columnGap="4px"
            justifyContent="flex-start"
            sx={{
              width: buttonWidth ?? '100px',
              justifyContent: { xs: 'end', sm: 'flex-start' },
              cursor: disabled ? 'auto' : 'pointer',
              borderRadius: '4px',
              padding: '4px 8px',
              ':hover': {
                backgroundColor: (theme) => theme.color.gray[100],
              },
            }}
          >
            <Box>{startIcon}</Box>
            <Typography
              variant="bodySm"
              sx={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: '120px',
                display: { xs: responsiveNoHide ? 'block' : 'none', sm: 'block' },
              }}
            >
              {buttonContent}
            </Typography>
          </Stack>
        ) : (
          <SelectorButton
            startIcon={startIcon}
            buttonContent={buttonContent}
            outlined={disableOutline}
            disabled={disabled}
          />
        )}
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
      >
        <StyledAutocomplete
          id={selectorType}
          onBlur={() => {
            setAnchorEl(null)
          }}
          openOnFocus
          autoHighlight
          options={extraOption ? [extraOption, ...options] : options}
          value={value}
          onChange={(_, newValue: unknown) => {
            if (newValue) {
              getSelectedValue(newValue)
              setAnchorEl(null)
            }
          }}
          getOptionLabel={(option: unknown) => detectSelectorType(option)}
          groupBy={(option: unknown) =>
            selectorType === SelectorType.ASSIGNEE_SELECTOR ? UserTypesName[(option as IAssigneeCombined).type] : ''
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
      key={(option as ITemplate).id}
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
  console.log
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
        <Avatar
          alt={assignee?.givenName || assignee?.familyName}
          src={assignee.avatarImageUrl || assignee.iconImageUrl || 'user'}
          sx={{ width: '20px', height: '20px' }}
          variant={(option as IAssigneeCombined).type === 'companies' ? 'rounded' : 'circular'}
        />
        <Typography variant="sm" fontWeight={400}>
          {truncateText(
            (option as IAssigneeCombined)?.name ||
              `${(option as IAssigneeCombined)?.givenName ?? ''} ${(option as IAssigneeCombined)?.familyName ?? ''}`.trim(),
            TruncateMaxNumber.SELECTOR,
          )}
        </Typography>
      </Stack>
    </Box>
  )
}

const SelectorButton = ({
  buttonContent,
  startIcon,
  handleClick,
  enableBackground,
  outlined,
  disabled,
}: {
  startIcon?: ReactNode
  buttonContent: ReactNode
  handleClick?: () => void
  enableBackground?: boolean
  outlined?: boolean
  disabled?: boolean
}) => {
  return (
    <Button
      variant="outlined"
      startIcon={startIcon ? startIcon : null}
      sx={(theme) => ({
        textTransform: 'none',
        border: enableBackground || outlined ? 'none' : `1px solid ${theme.color.borders.border}`,
        bgcolor: enableBackground ? theme.color.gray[150] : '',
        '&:hover': {
          border: enableBackground || outlined ? 'none' : `1px solid ${theme.color.borders.border}`,
        },
        padding: { xs: '1px 9px', md: '4px 16px' },
        cursor: disabled ? 'auto' : 'pointer',
      })}
      onClick={handleClick}
      disableRipple
      disableTouchRipple
    >
      {buttonContent}
    </Button>
  )
}
