import React, { useEffect, useRef } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs, { Dayjs } from 'dayjs'
import { CalenderIcon, CalenderIconSmall } from '@/icons'
import { Box, Popper, Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '../buttons/SecondaryBtn'
import { useState } from 'react'
import { Sizes } from '@/types/interfaces'
import { DueDateLayout } from '@/components/layouts/DueDateLayout'

interface Prop {
  getDate: (value: string) => void
  dateValue?: Date | string
  disabled?: boolean
  size?: Sizes
  padding?: string
  height?: string
  gap?: string
  variant?: 'button' | 'icon' | 'normal'
  isDone?: boolean
  isShort?: boolean
}

export const DatePickerComponent = ({
  getDate,
  dateValue,
  disabled,
  size = Sizes.SMALL,
  padding,
  height,
  gap,
  variant = 'normal',
  isDone,
  isShort = false,
}: Prop) => {
  const [value, setValue] = useState(dateValue ? dayjs(dateValue) : null)

  const formatDate = (date: Dayjs | null) => {
    return date ? date.format('MMMM D, YYYY') : '' // Format the date as "March 8, 2024"
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(anchorEl ? null : event.currentTarget)
    }
  }

  const open = Boolean(anchorEl)
  const id = open ? 'calender-element' : undefined

  useEffect(() => {
    setValue(dateValue ? dayjs(dateValue) : null)
  }, [dateValue])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack
        direction="row"
        alignItems="center"
        columnGap="7px"
        onClick={handleClick}
        aria-describedby={id}
        sx={{
          cursor: disabled ? 'auto' : 'pointer',
          padding: variant == 'button' || variant == 'icon' ? '0px' : '4px 8px',
          borderRadius: '4px',
        }}
      >
        {variant == 'button' ? (
          <SecondaryBtn
            height={height}
            padding={padding}
            buttonContent={
              <Stack direction="row" alignItems="center" columnGap={gap ?? '8px'}>
                {size === Sizes.SMALL ? <CalenderIconSmall /> : <CalenderIcon />}

                {value ? (
                  size === Sizes.SMALL ? (
                    <Typography
                      variant="bodySm"
                      sx={{
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '12px',
                        overflow: 'hidden',
                        maxWidth: { xs: '100px', sm: 'none' },
                        color: (theme) => theme.color.gray[600],
                      }}
                    >
                      {formatDate(value)}
                    </Typography>
                  ) : (
                    <Typography variant="md" lineHeight="22px">
                      {formatDate(value)}
                    </Typography>
                  )
                ) : (
                  <Typography
                    variant={size === Sizes.SMALL ? 'bodySm' : 'md'}
                    sx={{
                      fontSize: size === Sizes.SMALL ? '12px' : undefined,
                      color: (theme) => theme.color.text.textDisabled,
                    }}
                  >
                    Due date
                  </Typography>
                )}
              </Stack>
            }
          />
        ) : variant === 'normal' ? (
          <>
            <Box>
              <CalenderIcon />
            </Box>
            <Typography
              variant="md"
              mt="2px"
              lineHeight={'22px'}
              sx={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: '150px',
                userSelect: 'none',
              }}
            >
              {value ? formatDate(value) : 'None'}
            </Typography>
          </>
        ) : (
          <Box
            sx={{
              padding: padding,
              borderRadius: '4px',
              ':hover': {
                cursor: 'pointer',
                ...(!disabled && {
                  background: (theme) => theme.color.gray[150],
                }),
              },
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <DueDateLayout
              dateString={value?.format('YYYY-MM-DD') ?? ''}
              isDone={isDone ?? false}
              variant={isShort ? 'short' : 'long'}
            />
          </Box>
        )}
      </Stack>
      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        // This hides popper's tooltip that helps position the content. display: none would mess up the positioning
        sx={{
          opacity: 0,
        }}
      >
        <DatePicker
          disablePast
          value={value}
          open={open}
          onClose={() => setAnchorEl(null)}
          onChange={(newValue) => {
            setValue(newValue)
            getDate(formatDate(newValue))
          }}
          slotProps={{
            day: {
              sx: {
                '&.MuiPickersDay-root.Mui-selected': {
                  backgroundColor: (theme) => theme.color.gray[500],
                },
              },
            },
            yearButton: {
              sx: {
                '&.MuiPickersYear-yearButton.Mui-selected': {
                  backgroundColor: '#6B6F76',
                },
              },
            },
          }}
          sx={{
            '& .MuiOutlinedInput-input': {
              padding: 2,
              paddingLeft: 2,
              fontSize: '14px',
              display: 'none',
            },
            '& .MuiButtonBase-root': {
              display: 'none',
            },
            '& .MuiOutlinedInput-root': {
              display: open ? 'block' : 'none',
              '& fieldset': {
                borderColor: (theme) => theme.color.gray[400],
              },
              '&:hover fieldset': {
                borderColor: (theme) => theme.color.gray[400],
              },
              '&.Mui-focused fieldset': {
                borderColor: (theme) => theme.color.gray[400],
              },
            },
          }}
          format={dateValue ? 'MMM DD, YYYY' : ''}
        />
      </Popper>
    </LocalizationProvider>
  )
}
