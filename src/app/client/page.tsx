import { ClientTaskCard } from '@/components/cards/ClientTaskCard'
import { ClientTaskRow } from '@/components/cards/ClientTaskRow'
import { Header } from '@/components/layouts/Header'

export default function ClientPage() {
  return (
    <>
      <Header showCreateTaskButton={false} />
      <ClientTaskRow />
      <ClientTaskCard />
    </>
  )
}
