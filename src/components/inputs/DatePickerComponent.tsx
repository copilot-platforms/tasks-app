import React from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs, { Dayjs } from 'dayjs'
import { CalenderIcon } from '@/icons'

interface Prop {
  getDate: (value: string) => void
  dateValue: string
}

export const DatePickerComponent = ({ getDate, dateValue }: Prop) => {
  const [value, setValue] = React.useState<Dayjs | null>(dayjs(dateValue))

  const formatDate = (date: Dayjs | null) => {
    return date ? date.format('MMM DD, YYYY') : '' // Format the date as "Mar 08, 2024"
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value}
        onChange={(newValue) => {
          getDate(formatDate(value))
          setValue(newValue)
        }}
        sx={{
          '& .MuiOutlinedInput-input': {
            padding: 2,
            paddingLeft: 2,
            fontSize: '14px',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
            },
          },
        }}
        slotProps={{
          inputAdornment: {
            position: 'start',
          },
        }}
        slots={{ openPickerIcon: CalenderIcon }}
        format="MMM DD, YYYY"
      />
    </LocalizationProvider>
  )
}
