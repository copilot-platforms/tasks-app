import { createTheme } from '@mui/material'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const theme = createTheme({
  spacing: 4,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      sd: 735,
      md: 960,
      lg: 1280,
    },
  },
  shape: {
    radiusNone: 0,
    radius050: 0.5,
    radius100: 1,
    radius150: 1.5,
    radius200: 2,
    radius300: 3,
    radius400: 4,
    radius500: 5,
    radius600: 6,
    radiusFull: '9999px',
  },
  width: {
    xxs: '20rem',
    xs: '24rem',
    sm: '30rem',
    md: '35rem',
    lg: '40rem',
    xl: '48rem',
    '2xl': '64rem',
    '3xl': '80rem',
    '4xl': '90rem',
    '5xl': '100rem',
    '6xl': '120rem',
  },
  color: {
    base: {
      black: '#000000',
      white: '#ffffff',
    },
    gray: {
      100: '#F8F9FB',
      150: '#EFF1F4',
      200: '#DFE1E4',
      300: '#C9CBCD',
      400: '#90959D',
      500: '#6B6F76',
      600: '#212B36',
      700: '#0E0E10',
    },
    brand: {
      light: '#E3FF33',
      midLight: '#7DDAA0',
      primary: '#09AA6C',
      midDark: '#003f27',
      dark: '#00160E',
    },
    text: {
      text: '#212B36',
      textSecondary: '#6B6F76',
      textDisabled: '#90959D',
    },
    borders: {
      border: '#DFE1E4',
      borderHover: '#C9CBCD',
      borderDisabled: '#EFF1F4',
      border2: '#EDEDF0',
      border3: '#DADBDC',
    },
    background: {
      bgCard: '#DFE1E4',
      bgCallout: '#F8F9FB',
    },
    error: '#CC0000',
    muiError: '#D32F2F',
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    display: {
      fontFamily: inter.style.fontFamily,
      fontSize: '56px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '64px',
    },
    displaySm: {
      fontFamily: inter.style.fontFamily,
      fontSize: '46px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '54px',
    },
    '4xl': {
      fontFamily: inter.style.fontFamily,
      fontSize: '38px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '46px',
    },
    '3xl': {
      fontFamily: inter.style.fontFamily,
      fontSize: '30px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '38px',
    },
    '2xl': {
      fontFamily: inter.style.fontFamily,
      fontSize: '24px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '32px',
    },
    xl: {
      fontFamily: inter.style.fontFamily,
      fontSize: '20px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '28px',
    },
    lg: {
      fontFamily: inter.style.fontFamily,
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '24px',
      color: '#212B36',
    },
    md: {
      fontFamily: inter.style.fontFamily,
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '20px',
      color: '#212B36',
    },
    sm: {
      fontFamily: inter.style.fontFamily,
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '20px',
    },
    xs: {
      fontFamily: inter.style.fontFamily,
      fontSize: '10px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '18px',
    },
    bodyLg: {
      fontFamily: inter.style.fontFamily,
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '24px',
    },
    bodyMd: {
      fontFamily: inter.style.fontFamily,
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '22px',
    },
    bodySm: {
      fontFamily: inter.style.fontFamily,
      fontSize: '13px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '20px',
    },
    bodyXs: {
      fontFamily: inter.style.fontFamily,
      fontSize: '10px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '18px',
    },
  },
  components: {
    MuiAutocomplete: {
      styleOverrides: {
        option: {
          '&[aria-selected="true"]': {
            backgroundColor: '#e3abed',
          },
          height: '32px !important',
          minHeight: '32px !important',
        },
      },
    },
  },
})
