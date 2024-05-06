import { Box, Typography } from '@mui/material'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { ReactNode } from 'react'

export type FilterButtons = {
  name: string
  onClick: (index: number) => void
}

const FilterButtonGroup = ({
  filterButtons,
  activeButtonIndex,
}: {
  filterButtons: FilterButtons[]
  activeButtonIndex: number | undefined
}) => {
  return (
    <Box
      sx={(theme) => ({
        border: `1px solid ${theme.color.borders.border}`,
        borderRadius: 1,
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        padding: '4px',
      })}
    >
      {filterButtons.map((item, index) => {
        return (
          <SecondaryBtn
            key={index}
            buttonContent={
              <Typography
                variant="bodySm"
                fontWeight={500}
                fontSize="12px"
                sx={{
                  color: (theme) => (index === activeButtonIndex ? theme.color.gray[600] : theme.color.gray[500]),
                }}
              >
                {item.name}
              </Typography>
            }
            handleClick={() => item.onClick(index)}
            noBackground
            enableBackground={index === activeButtonIndex ? true : false}
          />
        )
      })}
    </Box>
  )
}

export default FilterButtonGroup
