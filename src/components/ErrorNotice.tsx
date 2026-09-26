import type { ApiRequestError } from '../types/api'
import { errorText, errorTitle } from '../lib/errors'
import '../styles/ErrorNotice.css'

interface ErrorNoticeProps {
  error: ApiRequestError
  /** The line marked in the output editor, if the error message named one. */
  errorLine: number | null
  /** Whether the API returned generated code to show below. */
  hasCode: boolean
}

export function ErrorNotice({ error, errorLine, hasCode }: ErrorNoticeProps) {
  return (
    <div className="notice" role="alert">
      <strong>{errorTitle(error)}</strong>
      {error.errorType && (
        <code>
          {error.code ? `${error.code} ` : ''}
          {error.errorType}
        </code>
      )}
      <code>{errorText(error)}</code>
      {hasCode && (
        <span>
          The generated code is below{errorLine ? ' with the failing line marked' : ''}, so you can fix it by hand.
        </span>
      )}
    </div>
  )
}