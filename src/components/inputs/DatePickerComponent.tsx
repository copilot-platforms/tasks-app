import React, { useRef } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs, { Dayjs } from 'dayjs'
import { CalenderIcon, CalenderIcon2 } from '@/icons'
import { IsoDate } from '@/types/dto/tasks.dto'
import { Box, Popper, Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '../buttons/SecondaryBtn'

interface Prop {
  getDate: (value: string) => void
  dateValue?: IsoDate
  isButton?: boolean
  disabled?: boolean
}

export const DatePickerComponent = ({ getDate, dateValue, disabled, isButton = false }: Prop) => {
  const [value, setValue] = React.useState<Dayjs | null>(dateValue ? dayjs(dateValue) : null)

  const formatDate = (date: Dayjs | null) => {
    return date ? date.format('MMM DD, YYYY') : '' // Format the date as "Mar 08, 2024"
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

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
            startIcon={<CalenderIcon2 />}
            buttonContent={
              <Typography variant="bodySm" lineHeight="20px" sx={{ color: (theme) => theme.color.gray[600] }}>
                {value ? formatDate(value) : 'Empty'}
              </Typography>
            }
          />
        ) : (
          <>
            <Box>
              <CalenderIcon2 />
            </Box>
            <Typography variant="bodyMd" mt="2px">
              {value ? formatDate(value) : 'Empty'}
            </Typography>
          </>
        )}
      </Stack>
      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
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
        <DatePicker
          disablePast
          value={value}
          open={open}
          onClose={() => setAnchorEl(null)}
          onChange={(newValue) => {
            getDate(formatDate(newValue))
            setValue(newValue)
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
