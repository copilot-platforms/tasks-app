export declare class CopilotApiError extends Error {
  readonly status: number
  readonly body: {
    message: string
  }
}
