import { CopilotTooltip } from '@/components/atoms/CopilotTooltip'
import { InfoIcon } from '@/icons'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { FilterType } from '@/types/common'
import { FilterOptionsKeywords, IFilterOptions } from '@/types/interfaces'
import { Box, Stack, Typography } from '@mui/material'
import { useSelector } from 'react-redux'

const FILTER_MODES = [FilterType.Assignee, FilterType.Visibility, FilterType.Creator]

interface FilterTypeSectionProps {
  setFilterMode: React.Dispatch<React.SetStateAction<FilterType | null>>
}

export const FilterTypeSection = ({ setFilterMode }: FilterTypeSectionProps) => {
  const {
    filterOptions: { type },
  } = useSelector(selectTaskBoard)

  const disabled = type === FilterOptionsKeywords.CLIENTS ? [FilterType.Visibility] : []
  const removed = type.length > 20 ? [FilterType.Assignee] : []

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
      {FILTER_MODES.map((filterMode) => {
        const isDisabled = disabled.includes(filterMode)
        const isRemoved = removed.includes(filterMode)
        if (isRemoved) return null

        return (
          <Stack
            direction="row"
            key={filterMode}
            columnGap="12px"
            sx={(theme) => ({
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px  16px 4px 12px',
              lineHeight: '22px',
              fontSize: '14px',
              width: '180px',
              color: isDisabled ? theme.color.text.textDisabled : theme.color.text.textPrimary,
              background: isDisabled ? theme.color.gray[100] : 'white',
              ':hover': {
                cursor: 'pointer',
                background: theme.color.gray[100],
              },
            })}
            onClick={() => {
              !isDisabled && setFilterMode(filterMode)
            }}
          >
            <Box>
              <Typography variant="bodySm" fontWeight={400} lineHeight={'21px'}>
                {filterMode}
              </Typography>
            </Box>
            {isDisabled && (
              <Box>
                <CopilotTooltip
                  content={
                    <div>
                      <div>Client visibility is only available</div>
                      <div>for tasks assigned to internal users.</div>
                    </div>
                  }
                >
                  <InfoIcon />
                </CopilotTooltip>
              </Box>
            )}
          </Stack>
        )
      })}
    </Stack>
  )
}
