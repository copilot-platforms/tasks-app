import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs, { Dayjs } from 'dayjs'
import { CalenderIcon, CalenderIconSmall } from '@/icons'
import { Box, Popper, Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '../buttons/SecondaryBtn'
import { useState } from 'react'

interface Prop {
  getDate: (value: string) => void
  dateValue?: Date
  isButton?: boolean
  disabled?: boolean
}

export const DatePickerComponent = ({ getDate, dateValue, disabled, isButton = false }: Prop) => {
  const [value, setValue] = useState<Dayjs | null>(dateValue ? dayjs(dateValue) : null)

  const formatDate = (date: Dayjs | null) => {
    return date ? date.format('MMMM DD, YYYY') : '' // Format the date as "March 08, 2024"
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(anchorEl ? null : event.currentTarget)
    }
  }

  const open = Boolean(anchorEl)
  const id = open ? 'calender-element' : undefined

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
          padding: isButton ? '0px' : '4px 8px',
          borderRadius: '4px',
          ':hover': {
            backgroundColor: (theme) => theme.color.gray[100],
          },
        }}
      >
        {isButton ? (
          <SecondaryBtn
            startIcon={<CalenderIconSmall />}
            buttonContent={
              <Typography
                variant="bodySm"
                sx={{
                  color: (theme) => theme.color.gray[600],
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '12px',
                  overflow: 'hidden',
                  maxWidth: { xs: '100px', sm: 'none' },
                }}
                title={value ? formatDate(value) : 'Due date'}
              >
                {value ? formatDate(value) : 'Due date'}
              </Typography>
            }
          />
        ) : (
          <>
            <Box>
              <CalenderIcon />
            </Box>
            <Typography
              variant="md"
              mt="2px"
              lineHeight={'22px'}
              sx={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '150px' }}
            >
              {value ? formatDate(value) : 'No due date'}
            </Typography>
          </>
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
            getDate(formatDate(newValue))
            setValue(newValue)
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
