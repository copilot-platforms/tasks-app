import { useRouter } from 'next/navigation'
import { PropsWithChildren, useEffect } from 'react'

export const RevalidateOnNavigation = ({ children }: PropsWithChildren) => {
  const router = useRouter()

  useEffect(() => {
    router.refresh()
  }, []) //todo : refresh only on browser navigation.

  return <>{children}</>
}

// This component is to be depricated when we have a better solution for revalidating on navigation. Possibly on Next 15.
