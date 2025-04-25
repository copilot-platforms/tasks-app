import { apiUrl } from '@/config'
import { PropsWithToken } from '@/types/interfaces'

export const ValidateNotificationCountFetcher = async ({ token }: PropsWithToken) => {
  await fetch(`${apiUrl}/api/notification/validate-count?token=${token}`)
  return <></>
}
