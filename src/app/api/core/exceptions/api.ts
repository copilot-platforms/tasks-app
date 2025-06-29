/**
 * Represents an API error throughout the Tasks app, allowing for strongly-typed error throwing and consistent responses.
 * Extend this for additional error codes/status/fields if needed.
 */
export default class APIError extends Error {
  public readonly status: number
  public override readonly message: string
  public readonly errors?: unknown[]

  constructor(status: number = 500, message: string = 'Something went wrong', errors?: unknown[]) {
    super(message)
    this.status = status
    this.message = message
    this.errors = errors
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
