export class CopilotApiError extends Error {
  readonly status: number
  readonly body: {
    message: string
  }
  constructor(status: number, body: { message: string }) {
    super(body.message)
    this.status = status
    this.body = body
  }
}
