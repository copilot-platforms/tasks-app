import { ArrowRightIcon } from '@/icons'
import { Box, Stack, Typography } from '@mui/material'

export const ManageTemplatesEndOption = ({ hasTemplates }: { hasTemplates: boolean }) => {
  return (
    <Stack
      id="manage-templates-btn"
      key={'Manage templates'}
      direction="row"
      pl="16px"
      py="6px"
      justifyContent="space-between"
      sx={{
        borderTop: (theme) => `${hasTemplates ? '1px' : '0px'} solid ${theme.color.borders.borderDisabled}`,
        borderBottom: (theme) => `0px solid ${theme.color.borders.borderDisabled}`,
        cursor: 'pointer',
        lineHeight: '21px',
        ':hover': (theme) => ({
          zIndex: '999',
          bgcolor: theme.color.background.bgHover,
        }),
      }}
    >
      <Typography variant="sm">
        <Box display="flex" gap="4px" alignItems="center" sx={{ color: (theme) => theme.color.gray[600] }}>
          Manage templates
          <ArrowRightIcon />
        </Box>
      </Typography>
    </Stack>
  )
}
