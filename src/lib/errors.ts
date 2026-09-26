import { ApiRequestError } from '../types/api'

/** "main.go:69:4: declared and not used" -> 69 */
export function findErrorLine(message: string): number | null {
  const match = message.match(/main\.\w+:(\d+)/)
  return match ? Number(match[1]) : null
}

export function errorTitle(error: ApiRequestError): string {
  if (error.errorType === 'CODE_VALIDATION_FAILED') return 'Validation failed'
  if (error.status === 0) return 'Server unreachable'
  return 'Request failed'
}

/** The text to show under the title: field messages for form errors, else the main message. */
export function errorText(error: ApiRequestError): string {
  return error.details?.length ? error.details.map((d) => d.message).join(' ') : error.message
}