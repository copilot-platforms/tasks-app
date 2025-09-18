import { apiUrl } from '@/config'
import { PropsWithToken } from '@/types/interfaces'

export const ValidateNotificationCountFetcher = async ({ token }: PropsWithToken) => {
  try {
    await fetch(`${apiUrl}/api/notification/validate-count?token=${token}`)
  } catch (err) {
    console.error('Validate notifications failed :', err)
  }

  return <></>
}
