import { Stack, Tab, Tabs } from '@mui/material'
import { FilterButtonsGroupSelector } from '@/components/inputs/FilterButtonsGroupSelector'

export type FilterButtons = {
  name: string
  id: string
  onClick: (index: number) => void
}

type FilterButtonGroupProps = {
  filterButtons: FilterButtons[]
  activeButtonIndex: number
  mobileView?: boolean
}

const FilterButtonGroup = ({ filterButtons, activeButtonIndex, mobileView = false }: FilterButtonGroupProps) => {
  if (!filterButtons.length) {
    return null
  }

  if (mobileView) {
    return (
      <Stack
        sx={{
          columnGap: '8px',
          padding: '4px 20px',
          height: '48px',
          justifyContent: 'space-between',
          '@media (max-width: 330px)': {
            flexWrap: 'wrap',
            height: 'auto',
          },
        }}
        direction={'row'}
      >
        <FilterButtonsGroupSelector filterButtons={filterButtons} activeButtonIndex={activeButtonIndex} />
      </Stack>
    )
  }

  return (
    <Stack
      sx={(theme) => ({
        columnGap: '8px',
        padding: '4px 20px',
        height: '32px',
        justifyContent: 'space-between',
        '@media (max-width: 330px)': {
          flexWrap: 'wrap',
          height: 'auto',
        },
      })}
      direction={'row'}
    >
      <Tabs
        value={activeButtonIndex}
        aria-label="wrapped label tabs example"
        TabIndicatorProps={{
          sx: {
            backgroundColor: '#1F2937',
          },
        }}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'unset',
          height: '45px',
          '& .MuiTabs-flexContainer': {
            gap: '12px',
          },
        }}
      >
        {filterButtons.map((item, index) => {
          return (
            <Tab
              key={item.id}
              value={index}
              label={item.name}
              onClick={() => item.onClick(index)}
              sx={{
                textTransform: 'none',
                fontSize: 14,
                fontWeight: 400,
                lineHeight: '22px',
                minHeight: 'unset',
                paddingY: 0,
                paddingX: '4px',
                height: '45px',
                minWidth: '60px',

                fontColor: (theme) => theme.color.text,
                color: (theme) => theme.color.text.text,

                '&.Mui-selected': {
                  color: (theme) => theme.color.text.text,
                },
              }}
              disableRipple
            />
          )
        })}
      </Tabs>
    </Stack>
  )
}

export default FilterButtonGroup
