import { BoldTypography, StyledTypography } from '@/app/detail/ui/styledComponent'
import { ActivityType } from '@/types/interfaces'
import { Typography } from '@mui/material'

type ActivityDescription = {
  [key in ActivityType]: string | ((...args: any[]) => React.ReactNode)
}

const activityDescription: ActivityDescription = {
  [ActivityType.CREATE_TASK]: () => <StyledTypography> created task. </StyledTypography>,
  [ActivityType.ASSIGN_TASK]: (to: string) => (
    <>
      <StyledTypography> assigned task to </StyledTypography>
      <BoldTypography>{to}.</BoldTypography>
    </>
  ),
  [ActivityType.WORKFLOWSTATE_UPDATE]: (from: string, to: string) => (
    <>
      <StyledTypography> changed status from </StyledTypography>
      <BoldTypography>{from}</BoldTypography>
      <StyledTypography> to </StyledTypography>
      <BoldTypography>{to}.</BoldTypography>
    </>
  ),
}

type ActivityDescriptionProps = {
  activityType: ActivityType
  args?: any[]
}

export default function ActivityDescription({ activityType, args = [] }: ActivityDescriptionProps) {
  const description = activityDescription[activityType]
  const renderDescription = typeof description === 'function' ? description(...args) : description
  return <> {renderDescription}</>
}
