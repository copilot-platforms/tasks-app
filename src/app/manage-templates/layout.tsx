import { ReactNode } from 'react'
import { ManageTemplateHeader } from './ui/Header'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <ManageTemplateHeader showNewTemplateButton={false} />
      {children}
    </>
  )
}
