import { DndWrapper } from '@/hoc/DndWrapper'
import { TaskBoard } from './ui/TaskBoard'
import { Header } from '@/components/layouts/Header'
import { z } from 'zod'
import InvalidToken from '@/components/invalidToken'

export default function Main({ searchParams }: { searchParams: { token: string } }) {
  const token = z.string().safeParse(searchParams.token)

  if (!token.success) {
    return <InvalidToken />
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
