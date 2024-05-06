import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TemplateBoard } from './ui/TemplateBoard'

export default async function ManageTemplatesPage() {
  return (
    <AppMargin size={SizeofAppMargin.LARGE}>
      <TemplateBoard />
    </AppMargin>
  )
}
