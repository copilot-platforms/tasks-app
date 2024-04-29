import { ClientTaskCard } from '@/components/cards/ClientTaskCard'
// import { TaskRow } from '@/components/cards/TaskRow'
import { Header } from '@/components/layouts/Header'

export default function ClientPage() {
  return (
    <>
      <Header showCreateTaskButton={false} />
      {/* <TaskRow showConfigurableIcons={false} /> */}
      <ClientTaskCard />
    </>
  )
}
