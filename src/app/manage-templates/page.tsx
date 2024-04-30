import { NoTemplateLayout } from '@/components/layouts/NoTemplateLayout'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'

export default async function ManageTemplatesPage() {
  return (
    <AppMargin size={SizeofAppMargin.LARGE}>
      <NoTemplateLayout />
    </AppMargin>
  )
}
