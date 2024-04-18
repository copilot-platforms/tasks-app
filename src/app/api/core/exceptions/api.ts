/**
 * Custom error class representing an error that occurred in Tasks API.
 * Extends the built-in Error class.
 * @param {string} status - Response status code for this request
 * @param {string} message - Response error message
 */
class APIError extends Error {
  status: number
  message: string

  constructor(status: number = 500, message: string = 'Something went wrong') {
    super(message)
    this.status = status
    this.message = message
  }
}

export default APIError
