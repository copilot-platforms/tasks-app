'use client'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { TemplateCard } from '@/components/cards/TemplateCard'
import { Stack } from '@mui/material'
import { TemplateForm } from './ui/TemplateForm'

export default async function ManageTemplatesPage() {
  return (
    <AppMargin size={SizeofAppMargin.LARGE}>
      <Stack
        direction="column"
        py="40px"
        sx={{
          width: '60%',
          margin: '0 auto',
        }}
        rowGap={4}
      >
        <TemplateCard templateName={'Onboarding'} />
        <TemplateCard templateName={'Sessions'} />
      </Stack>

      <TemplateForm handleCreate={() => {}} />
    </AppMargin>
  )
}
