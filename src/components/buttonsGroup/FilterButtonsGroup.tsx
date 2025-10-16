import { Stack, Typography } from '@mui/material'
import { TertiaryBtn } from '../buttons/TertiaryBtn'

export type FilterButtons = {
  name: string
  id: string
  onClick: (index: number) => void
}

type FilterButtonGroupProps = {
  filterButtons: FilterButtons[]
  activeButtonIndex: number | undefined
}

const FilterButtonGroup = ({ filterButtons, activeButtonIndex }: FilterButtonGroupProps) => {
  return (
    <Stack
      sx={(theme) => ({
        border: `1px solid ${theme.color.borders.border}`,
        borderRadius: 1,
        columnGap: '8px',
        padding: '4px 4px',
        height: '32px',
        justifyContent: 'space-between',
        '@media (max-width: 330px)': {
          flexWrap: 'wrap',
          height: 'auto',
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
