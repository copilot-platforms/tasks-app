import { FilterType } from '@/types/common'
import { Stack, Typography } from '@mui/material'

const FILTER_MODES = [FilterType.Assignee, FilterType.Visibility, FilterType.Creator]

interface FilterTypeSectionProps {
  setFilterMode: React.Dispatch<React.SetStateAction<FilterType | null>>
}

export const FilterTypeSection = ({ setFilterMode }: FilterTypeSectionProps) => {
  return (
    <Stack
      direction="column"
      sx={{
        boxShadow: '0px 6px 20px 0px rgba(0, 0, 0, 0.12)',
        background: (theme) => theme.color.base.white,
        borderRadius: '4px',
      }}
      rowGap={'2px'}
    >
      {FILTER_MODES.map((el, key) => {
        return (
          <Stack
            direction="row"
            key={key}
            columnGap="12px"
            sx={{
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '4px  16px 4px 12px',
              lineHeight: '22px',
              fontSize: '14px',
              width: '180px',
              ':hover': {
                cursor: 'pointer',
                background: (theme) => theme.color.gray[100],
              },
            }}
            onClick={() => {
              setFilterMode(el)
            }}
          >
            <Typography variant="bodySm" fontWeight={400} lineHeight={'21px'}>
              {el}
            </Typography>
          </Stack>
        )
      })}
    </Stack>
  )
}
