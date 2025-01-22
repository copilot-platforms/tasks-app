import { Box, Button, Popper, Stack, Typography } from '@mui/material'
import { StyledAutocomplete } from '@/components/inputs/Autocomplete'
import { statusIcons } from '@/utils/iconMatcher'
import { useFocusableInput } from '@/hooks/useFocusableInput'
import { HTMLAttributes, ReactNode, useEffect, useMemo, useState } from 'react'
import { StyledTextField } from './TextField'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssigneeCombined, Sizes, IExtraOption, ITemplate, UserTypesName } from '@/types/interfaces'
import { TruncateMaxNumber } from '@/types/constants'
import { truncateText } from '@/utils/truncateText'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { getAssigneeName } from '@/utils/assignee'
import { StyledHelperText } from '@/components/error/FormHelperText'
import React from 'react'
import { ListComponent } from '@/components/inputs/ListComponent'
import { ModifierArguments } from '@popperjs/core'
import { Property } from 'csstype'

export enum SelectorType {
  ASSIGNEE_SELECTOR = 'assigneeSelector',
  STATUS_SELECTOR = 'statusSelector',
  TEMPLATE_SELECTOR = 'templateSelected',
}
type SelectorOptionsType = {
  [K in keyof typeof SelectorType as `${(typeof SelectorType)[K]}`]: K extends 'ASSIGNEE_SELECTOR'
    ? IAssigneeCombined
    : K extends 'STATUS_SELECTOR'
      ? WorkflowStateResponse
      : K extends 'TEMPLATE_SELECTOR'
        ? ITemplate
        : never
}

interface Prop<T extends keyof SelectorOptionsType> {
  getSelectedValue: (value: unknown) => void
  startIcon: ReactNode
  value: unknown
  selectorType: T
  options: SelectorOptionsType[T][] | IExtraOption[]
  buttonContent: ReactNode
  inputStatusValue: string
  setInputStatusValue: React.Dispatch<React.SetStateAction<string>>
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
  endOption?: ReactNode
  endOptionHref?: string
  listAutoHeightMax?: string
  useClickHandler?: boolean
  cursor?: Property.Cursor
  currentOption?: SelectorOptionsType[T]
}

export default function Selector<T extends keyof SelectorOptionsType>({
  getSelectedValue,
  startIcon,
  value,
  selectorType,
  options,
  buttonContent,
  disabled,
  placeholder = 'Change status...',
  inputStatusValue,
  setInputStatusValue,
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
  endOption,
  endOptionHref,
  listAutoHeightMax,
  useClickHandler,
  cursor,
  currentOption,
}: Prop<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      setAnchorEl(anchorEl ? null : event.currentTarget)
    }
    onClick?.()
  }
  const open = Boolean(anchorEl)
  const id = open ? 'autocomplete-popper' : ''

  const setSelectorRef = useFocusableInput(open)

  const processedOptions = useMemo(() => {
    if (!currentOption) return options
    const filteredOptions = options.filter((option) => option.id !== currentOption.id)
    return [currentOption, ...filteredOptions]
  }, [currentOption, options])

  const standaloneOptionIds = useMemo(() => {
    return currentOption ? new Set([currentOption.id]) : new Set()
  }, [currentOption])

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
      return (option as ITemplate).title as string
    } else {
      return ''
    }
  }

  const [placement, setPlacement] = useState('')

  const handlePlacementChange = (data: ModifierArguments<any>) => {
    if (data.state && data.state.placement) {
      setPlacement(data.state.placement)
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

  const ListWithEndOption = (props: JSX.IntrinsicElements['div']) => (
    <ListComponent {...props} endOption={endOption} endOptionHref={endOptionHref} autoHeightMax={listAutoHeightMax} />
  )

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
              cursor: disabled ? 'auto' : (cursor ?? 'pointer'),
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
          placement={placement}
          id={selectorType}
          onBlur={() => {
            setAnchorEl(null)
          }}
          blurOnSelect={true}
          openOnFocus
          onKeyDown={handleKeyDown}
          ListboxProps={{ sx: { maxHeight: { xs: '175px', sm: '291px' }, padding: '0px 0px 8px 0px' } }}
          options={extraOption ? [extraOption, ...processedOptions] : processedOptions}
          value={value}
          onChange={(_, newValue: unknown) => {
            if (newValue && !useClickHandler) {
              getSelectedValue(newValue)
              setAnchorEl(null)
              setInputStatusValue('')
            }
          }}
          ListboxComponent={ListWithEndOption}
          getOptionLabel={(option: unknown) => detectSelectorType(option)}
          groupBy={(option: unknown) => {
            if (standaloneOptionIds.has((option as SelectorOptionsType[typeof selectorType]).id)) {
              return UserTypesName['standalone']
            }
            return selectorType === SelectorType.ASSIGNEE_SELECTOR ? UserTypesName[(option as IAssigneeCombined).type] : ''
          }}
          slotProps={{
            paper: {
              sx: {
                '& .MuiAutocomplete-noOptions': {
                  padding: '0px',
                },
                boxShadow: 'none',
                border: (theme) => `1px solid ${theme.color.borders.border2}`,
                borderTop: (theme) => (placement === 'top' ? `1px solid ${theme.color.borders.border2}` : 'none'),
                borderBottom: (theme) => (placement === 'top' ? 'none' : `1px solid ${theme.color.borders.border2}`),
                borderRadius: placement == 'top' ? '4px 4px 0px 0px' : '0px 0px 4px 4px',
              },
            },
            popper: {
              modifiers: [
                {
                  name: 'onUpdatePlacement',
                  enabled: true,
                  phase: 'afterWrite',
                  fn: handlePlacementChange,
                },
              ],
            },
          }}
          filterOptions={filterOption}
          renderGroup={(params) => {
            if (!params.children) return <></>

            const hasNoAssignee =
              Array.isArray(params?.children) &&
              params?.children?.some((child) => child?.props?.props?.key === 'No assignee')
            if (params.group === UserTypesName['standalone']) {
              return params.children
            }
            return (
              <>
                {hasNoAssignee ? (
                  <Box key={params.key}>{params.children}</Box>
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
                )}
              </>
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
                padding="4px 12px 8px 12px"
                basePadding="4px 12px 8px 12px"
                sx={{
                  width: '200px',
                  visibility: { xs: 'none', sm: 'visible' },
                  borderRadius: '4px',
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
          renderOption={(props, option: unknown) => {
            const onClickHandler = () => {
              getSelectedValue(option)
              setAnchorEl(null)
              setInputStatusValue('')
            }
            if ((option as IExtraOption).id === 'not_found') {
              return (
                <Box
                  sx={{
                    color: 'gray',
                    textAlign: 'left',
                    padding: '6px 14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '205px',
                  }}
                >
                  <Typography variant="sm" sx={{ color: (theme) => theme.color.text.textDisabled }}>
                    {`No matches found for "${inputStatusValue}"`}
                  </Typography>
                </Box>
              )
            }

            return extraOption && extraOptionRenderer && (option as IExtraOption)?.extraOptionFlag ? (
              extraOptionRenderer(setAnchorEl, anchorEl, props)
            ) : selectorType === SelectorType.ASSIGNEE_SELECTOR ? (
              <AssigneeSelectorRenderer props={props} option={option} />
            ) : selectorType === SelectorType.STATUS_SELECTOR ? (
              <StatusSelectorRenderer props={props} option={option} />
            ) : selectorType === SelectorType.TEMPLATE_SELECTOR ? (
              <TemplateSelectorRenderer
                props={props}
                option={option}
                onClickHandler={useClickHandler ? onClickHandler : undefined}
              />
            ) : (
              <></>
            )
          }}
          noOptionsText={endOption && <ListWithEndOption />}
        />
      </Popper>
    </Stack>
  )
}

const TemplateSelectorRenderer = ({
  props,
  option,
  onClickHandler,
}: {
  props: HTMLAttributes<HTMLLIElement>
  option: unknown
  onClickHandler?: () => void
}) => {
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
        '&.MuiAutocomplete-option': {
          minHeight: { xs: '32px' },
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        '&.MuiAutocomplete-option.Mui-focused': {
          bgcolor: (theme) => theme.color.background.bgHover,
        },
        '&.MuiAutocomplete-option:hover': {
          bgcolor: (theme) => theme.color.background.bgHover,
        },
      }}
      onClick={onClickHandler && onClickHandler}
    >
      <Stack direction="row" alignItems="center" columnGap={3}>
        <Typography
          variant="sm"
          fontWeight={400}
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}
        >
          {(option as ITemplate).title as string}
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
        <Box>{statusIcons[Sizes.LARGE][(option as WorkflowStateResponse).type]}</Box>
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
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        '&.MuiAutocomplete-option[aria-selected="true"]': {
          bgcolor: theme.color.base.white,
        },
        '&.MuiAutocomplete-option.Mui-focused': {
          bgcolor: theme.color.background.bgHover,
        },
        '&.MuiAutocomplete-option:hover': {
          bgcolor: theme.color.background.bgHover,
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
  cursor,
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
  cursor?: Property.Cursor
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
          bgcolor: disabled ? 'white' : theme.color.gray[100],
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
        cursor: disabled ? 'auto' : (cursor ?? 'pointer'),
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
