import { Stack, Typography } from '@mui/material'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { ReactNode } from 'react'
import { TertiaryBtn } from '../buttons/TertiaryBtn'

export type FilterButtons = {
  name: string
  id: string
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
    <Stack
      sx={(theme) => ({
        border: `1px solid ${theme.color.borders.border}`,
        borderRadius: 1,
        columnGap: '8px',
        padding: '2px 6px',
        height: { xs: 'auto', sm: '32px' },
        justifyContent: 'space-between',
        '@media (max-width: 330px)': {
          flexWrap: 'wrap',
        },
      })}
      direction={'row'}
    >
      {filterButtons.map((item, index) => {
        return (
          <TertiaryBtn
            key={item.id}
            buttonContent={
              <Typography
                variant="bodySm"
                fontWeight={500}
                fontSize="12px"
                sx={{
                  color: (theme) => (index === activeButtonIndex ? theme.color.gray[600] : theme.color.gray[500]),
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {item.name}
              </Typography>
            }
            handleClick={() => item.onClick(index)}
            outlined
            enableBackground={index === activeButtonIndex}
          />
        )
      })}
    </Stack>
  )
}

export default FilterButtonGroup
