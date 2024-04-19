'use client' // Error components must be Client Components

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <div>
      <h2>{error.message || 'Something went wrong!'}</h2>
    </div>
  )
}
