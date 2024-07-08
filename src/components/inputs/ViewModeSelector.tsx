import { BoardViewIcon, ListViewIcon } from '@/icons'
import { Stack, styled } from '@mui/material'
import { ViewMode } from '@prisma/client'

interface Prop {
  handleModeChange: (mode: ViewMode) => void
  selectedMode: ViewMode
}

export const ViewModeSelector = ({ handleModeChange, selectedMode }: Prop) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        border: (theme) => `1px solid ${theme.color.borders.border2}`,
        borderRadius: '4px',
        padding: '4px 6px 4px 6px',
        cursor: 'pointer',
      }}
    >
      <IconContainer
        justifyContent="center"
        alignItems="center"
        sx={{
          backgroundColor: selectedMode === ViewMode.list ? '#E8EBF1' : '',
        }}
        onClick={() => handleModeChange(ViewMode.list)}
      >
        <ListViewIcon />
      </IconContainer>

      <IconContainer
        justifyContent="center"
        alignItems="center"
        sx={{
          backgroundColor: selectedMode === ViewMode.board ? '#E8EBF1' : '',
        }}
        onClick={() => handleModeChange(ViewMode.board)}
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
