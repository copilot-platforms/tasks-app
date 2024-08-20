import { Avatar, Box, Button, Popper, Stack, Typography } from '@mui/material'
import { StyledAutocomplete } from '@/components/inputs/Autocomplete'
import { statusIcons } from '@/utils/iconMatcher'
import { useFocusableInput } from '@/hooks/useFocusableInput'
import { HTMLAttributes, ReactNode, useEffect, useState } from 'react'
import { StyledTextField } from './TextField'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssigneeCombined, IExtraOption, ITemplate, UserTypesName } from '@/types/interfaces'
import { TruncateMaxNumber } from '@/types/constants'

import { truncateText } from '@/utils/truncateText'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { getAssigneeName } from '@/utils/assignee'
import { StyledHelperText } from '@/components/error/FormHelperText'
import React from 'react'
import { ListComponent } from '@/components/inputs/ListComponent'

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
  padding?: string
  buttonWidth?: string
  buttonHeight?: string
  responsiveNoHide?: boolean
  handleInputChange?: (_: string) => void
  filterOption?: any
  onClick?: () => void
  error?: boolean
  endIcon?: ReactNode
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
  padding,
  buttonWidth,
  buttonHeight,
  responsiveNoHide,
  handleInputChange,
  filterOption,
  onClick,
  error,
  endIcon,
}: Prop) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      setAnchorEl(anchorEl ? null : event.currentTarget)
    }
    onClick?.()
  }

  const open = Boolean(anchorEl)
  const id = open ? 'autocomplete-popper' : ''

  const [inputStatusValue, setInputStatusValue] = useState('')

  const setSelectorRef = useFocusableInput(open)

  function detectSelectorType(option: unknown) {
    if (selectorType === SelectorType.ASSIGNEE_SELECTOR) {
      return (
        (option as IAssigneeCombined)?.name ||
        `${(option as IAssigneeCombined)?.givenName ?? ''} ${(option as IAssigneeCombined)?.familyName ?? ''}`.trim()
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      setAnchorEl(null)
    }
  }

  return (
    <Stack direction="column">
      <Box onClick={handleClick} aria-describedby={id}>
        {disableOutline ? (
          <Stack
            direction="row"
            alignItems="center"
            columnGap="7px"
            justifyContent="flex-start"
            sx={{
              width: { sm: responsiveNoHide ? buttonWidth || '100px' : '36px', md: buttonWidth || '100px' },
              justifyContent: { xs: 'flex-start', sm: 'flex-start' },
              cursor: disabled ? 'auto' : 'pointer',
              borderRadius: '4px',
              padding: '4px 8px',
              ':hover': {
                backgroundColor: disabled ? 'none' : (theme) => theme.color.gray[100],
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
                maxWidth: '150px',
                display: { xs: responsiveNoHide ? 'block' : 'none', sm: 'block' },
              }}
            >
              {buttonContent}
            </Typography>
          </Stack>
        ) : (
          <>
            <SelectorButton
              startIcon={startIcon}
              buttonContent={buttonContent}
              outlined={disableOutline}
              disabled={disabled}
              padding={padding}
              height={buttonHeight}
              error={error}
              endIcon={endIcon}
            />
            {error && <StyledHelperText> Required</StyledHelperText>}
          </>
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
          onKeyDown={handleKeyDown}
          ListboxProps={{ sx: { maxHeight: { xs: '175px', sm: '291px' } } }}
          options={extraOption ? [extraOption, ...options] : options}
          value={value}
          onChange={(_, newValue: unknown) => {
            if (newValue) {
              getSelectedValue(newValue)
              setAnchorEl(null)
            }
          }}
          ListboxComponent={ListComponent}
          getOptionLabel={(option: unknown) => detectSelectorType(option)}
          groupBy={(option: unknown) =>
            selectorType === SelectorType.ASSIGNEE_SELECTOR ? UserTypesName[(option as IAssigneeCombined).type] : ''
          }
          filterOptions={filterOption}
          renderGroup={(params) => {
            const hasNoAssignee =
              Array.isArray(params?.children) &&
              params?.children?.some((child) => child?.props?.props?.key === 'No assignee')
            if (!params.children) return <></>

            return hasNoAssignee ? (
              <Box key={params.key}> {params.children}</Box>
            ) : (
              <Box key={params.key} component="li">
                <Stack direction="row" alignItems="center" columnGap={2}>
                  <Typography
                    variant={'sm'}
                    sx={{
                      color: (theme) => theme.color.gray[500],
                      marginLeft: '18px',
                      padding: '2px 0px',
                      lineHeight: '24px',
                    }}
                  >
                    {params.group}
                  </Typography>
                </Stack>
                {params.children}
              </Box>
            )
          }}
          inputValue={inputStatusValue}
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
                onChange={(e) => {
                  handleInputChange?.(e.target.value)
                  setInputStatusValue(e.target.value)
                }}
                onBlur={() => {
                  setInputStatusValue('')
                  handleInputChange?.('')
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
  const assignee = option as IAssigneeCombined

  return (
    <Box
      component="li"
      {...props}
      sx={(theme) => ({
        '&.MuiAutocomplete-option': {
          minHeight: { xs: '32px' },
        },
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        '&.MuiAutocomplete-option[aria-selected="true"].Mui-focused': {
          bgcolor: theme.color.gray[150],
        },
        '&.MuiAutocomplete-option.Mui-focused': {
          bgcolor: theme.color.gray[150],
        },
      })}
    >
      <Stack direction="row" alignItems="center" columnGap={3}>
        <CopilotAvatar currentAssignee={assignee} />
        <Typography variant="bodySm" title={getAssigneeName(option as IAssigneeCombined)}>
          {truncateText(getAssigneeName(option as IAssigneeCombined), TruncateMaxNumber.SELECTOR)}
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
  padding,
  disabled,
  height,
  error,
  endIcon,
}: {
  startIcon?: ReactNode
  buttonContent: ReactNode
  handleClick?: () => void
  enableBackground?: boolean
  outlined?: boolean
  padding?: string
  disabled?: boolean
  height?: string
  error?: boolean
  endIcon?: ReactNode
}) => {
  return (
    <Button
      variant="outlined"
      startIcon={startIcon ? startIcon : null}
      endIcon={endIcon ? endIcon : null}
      sx={(theme) => ({
        textTransform: 'none',
        border:
          enableBackground || outlined
            ? 'none'
            : error
              ? `1px solid ${theme.color.muiError}`
              : `1px solid ${theme.color.borders.border}`,
        bgcolor: enableBackground ? theme.color.gray[150] : '',
        '&:hover': {
          bgcolor: theme.color.base.white,
          border:
            enableBackground || outlined
              ? 'none'
              : error
                ? `1px solid ${theme.color.muiError}`
                : `1px solid ${theme.color.borders.border}`,
        },
        '.MuiTouchRipple-child': {
          bgcolor: theme.color.borders.border,
        },
        padding: padding ? padding : { xs: '2px 9px', md: '4px 16px' },
        cursor: disabled ? 'auto' : 'pointer',
        '& .MuiButton-startIcon': {
          '& .MuiAvatar-root': {
            fontSize: '14px',
            fontWeight: '400',
          },
        },
        height: height ?? '32px',
      })}
      onClick={handleClick}
      disableRipple
      disableTouchRipple
    >
      {buttonContent}
    </Button>
  )
}
