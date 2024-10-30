import { apiUrl } from '@/config'

interface ValidateCountFetchProps {
  token: string
}

export const ValidateCountFetch = async ({ token }: ValidateCountFetchProps) => {
  await fetch(`${apiUrl}/api/notification/validate-count?token=${token}`)
  return <></>
}
