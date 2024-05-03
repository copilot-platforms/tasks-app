import { BoardViewIcon, ListViewIcon } from '@/icons'
import { View } from '@/types/interfaces'
import { Stack, styled } from '@mui/material'

interface Prop {
  handleModeChange: (mode: View) => void
  selectedMode: View
}

export const ViewModeSelector = ({ handleModeChange, selectedMode }: Prop) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        border: (theme) => `1px solid ${theme.color.borders.border2}`,
        borderRadius: '4px',
        padding: '3px',
        cursor: 'pointer',
      }}
    >
      <IconContainer
        justifyContent="center"
        alignItems="center"
        sx={{
          backgroundColor: selectedMode === View.LIST_VIEW ? '#E8EBF1' : '',
        }}
        onClick={() => handleModeChange(View.LIST_VIEW)}
      >
        <ListViewIcon />
      </IconContainer>

      <IconContainer
        justifyContent="center"
        alignItems="center"
        sx={{
          backgroundColor: selectedMode === View.BOARD_VIEW ? '#E8EBF1' : '',
        }}
        onClick={() => handleModeChange(View.BOARD_VIEW)}
      >
        <BoardViewIcon />
      </IconContainer>
    </Stack>
  )
}

const IconContainer = styled(Stack)({
  width: '24px',
  height: '24px',
  borderRadius: '2px',
})
