/**
 * Interface for errors with a status code.
 */
export interface StatusableError extends Error {
  readonly status: number
}

/**
 * Interface for errors with a message body.
 */
export interface MessagableError extends Error {
  readonly body?: {
    readonly message: string
  }
}

/**
 * Error class for Copilot API errors, with status and message body.
 */
export class CopilotApiError extends Error implements StatusableError, MessagableError {
  public readonly status: number
  public readonly body: { readonly message: string }

  constructor(status: number, body: { message: string }) {
    super(body.message)
    this.status = status
    this.body = { message: body.message }
    Object.setPrototypeOf(this, CopilotApiError.prototype)
  }
}
