import { ClientTaskCard } from '@/components/cards/ClientTaskCard'
import { Header } from '@/components/layouts/Header'

export default function ClientPage() {
  return (
    <>
      <Header dontIncludeCreateTaskButton />
      <ClientTaskCard />
    </>
  )
}
