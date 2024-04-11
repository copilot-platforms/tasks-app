# PLUMBER

Allows you to easily pipe together functions in NextJS API Route Handlers

This allows for much easier and well-organized reusable patterns for architecting your NextJS APIs

## Example Usage:

```ts
const middleware1 = async (req: NextRequest, params: { [k: string]: unknown }, next) => {
  // Logic
  if (someLogic) {
    throw new Error('This failed')
  }
  await next()
}

const middleware2 = ...

const errorHandler = async (error) => {
    return NextResponse.json({ error }, { status: 500})
}

const handler = async (req: NextRequest) => {
  // Handler code here
  return NextResponse.json({ msg: 'Success!' })
}

const GET = pipe(middleware1, middleware2, ..., handler, errorHandler)
```
