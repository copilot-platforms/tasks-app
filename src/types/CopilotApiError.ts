// Interfaces that implement a particular behavior of CopilotApiError
export interface StatusableError extends Error {
  status: number
}

export interface MessagableError extends Error {
  body?: {
    message: string
  }
}

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
