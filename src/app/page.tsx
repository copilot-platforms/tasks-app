import { DndWrapper } from '@/hoc/DndWrapper'
import { TaskBoard } from './ui/TaskBoard'
import { Header } from '@/components/layouts/Header'

export default function Main() {
  return (
    <>
      <DndWrapper>
        <Header />
        <TaskBoard />
      </DndWrapper>
    </>
  )
}
