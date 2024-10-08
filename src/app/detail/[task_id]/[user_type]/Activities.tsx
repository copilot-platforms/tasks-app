import { ActivityLog } from '@/app/detail/ui/ActivityLog'
import { apiUrl } from '@/config'
import { ActivityLog as ActivityLogType } from '@/types/activityLogs'
import { ActivityLogsResponseSchema } from '@/types/dto/activity.dto'
import { PropsWithToken } from '@/types/interfaces'
import { Box, Stack, Typography } from '@mui/material'

const getActivityLogs = async (token: string, taskId: string): Promise<ActivityLogType[]> => {
  const res = await fetch(`${apiUrl}/api/tasks/${taskId}/activity-logs?token=${token}`)
  const parsedRes = ActivityLogsResponseSchema.parse(await res.json())
  return parsedRes.data
}

interface ActivitiesProps extends PropsWithToken {
  taskId: string
}

export const Activities = async ({ token, taskId }: ActivitiesProps) => {
  const activities = await getActivityLogs(token, taskId)
  return (
    <Box className="activity-logs" sx={{ width: '100%', display: 'flex', flexDirection: 'column', marginTop: '16px' }}>
      <Typography variant="lg">Activity</Typography>
      <Stack
        sx={{
          direction: 'column',
          alignItems: 'left',
          pt: '16px',
          rowGap: { xs: '11px', sm: '22px' },
        }}
      >
        {activities.map((activity) => (
          <ActivityLog key={activity.id} log={activity} />
        ))}
      </Stack>
    </Box>
  )
}
