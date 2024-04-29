/**
 * Custom error class representing an error that occurred in Tasks API.
 * Extends the built-in Error class.
 * @param {string} status - Response status code for this request
 * @param {string} message - Response error message
 */
class APIError extends Error {
  constructor(
    public readonly status: number = 500,
    public readonly message: string = 'Something went wrong',
  ) {
    super(message)
  }
}

export default APIError
