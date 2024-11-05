import { apiUrl } from '@/config'

interface ValidateNotificationCountFetcherProps {
  token: string
}

export const ValidateNotificationCountFetcher = async ({ token }: ValidateNotificationCountFetcherProps) => {
  await fetch(`${apiUrl}/api/notification/validate-count?token=${token}`)
  return <></>
}
