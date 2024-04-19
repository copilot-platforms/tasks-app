import { DndWrapper } from '@/hoc/DndWrapper'
import { TaskBoard } from './ui/TaskBoard'
import { Header } from '@/components/layouts/Header'

async function getAllWorkflowStates() {}

export default async function Main({ searchParams }: { searchParams: { token: string } }) {
  const token = searchParams.token

  if (!token) {
    throw new Error('Please pass the token!')
  }

  return (
    <>
      <DndWrapper>
        <Header showCreateTaskButton={true} />
        <TaskBoard />
      </DndWrapper>
    </>
  )
}
