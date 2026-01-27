import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { IAssigneeCombined } from '@/types/interfaces'

type OverlappingAvatarsProps = {
  assignees: (IAssigneeCombined | undefined)[]
}

export const OverlappingAvatars: React.FC<OverlappingAvatarsProps> = ({ assignees }) => {
  const renderAvatar = (assignee: IAssigneeCombined | undefined, index: number) => {
    return (
      <CopilotAvatar
        size="xs"
        key={index}
        currentAssignee={assignee}
        style={{
          zIndex: assignees.length + index,
        }}
      />
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: 'fit-content',
      }}
      className="overlapping-avatar"
    >
      {assignees.slice(0, 3).map(renderAvatar)}
    </div>
  )
}
