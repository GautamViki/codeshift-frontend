import type { Status } from '../hooks/useTranspile'
import '../styles/StatusStrip.css'

interface StatusStripProps {
  status: Status
  elapsed: number
  cached: boolean | null
  validation: string | null
  validate: boolean
  /** Name of the validation tool for the target language, e.g. "go vet". */
  check: string
}

function formatSeconds(seconds: number): string {
  return seconds < 0.1 ? 'under 0.1 s' : `${seconds.toFixed(1)} s`
}

export function StatusStrip({ status, elapsed, cached, validation, validate, check }: StatusStripProps) {
  return (
    <div className="status" role="status" aria-live="polite">
      {status === 'idle' && (
        <>
          <span className="dot" />
          <span>Output appears here after you transpile.</span>
        </>
      )}

      {status === 'loading' && (
        <>
          <span className="dot pulse" />
          <span>Waiting for the model…</span>
        </>
      )}

      {status === 'failed' && (
        <>
          <span className="dot bad" />
          <span className="bad">Failed after {formatSeconds(elapsed)}</span>
        </>
      )}

      {status === 'done' && (
        <>
          <span className={`dot${validate ? ' ok' : ''}`} />
          <span className="good">Done in {formatSeconds(elapsed)}</span>
          {cached !== null && (
            <>
              <span className="sep" />
              <span>{cached ? 'Served from cache' : 'Fresh result'}</span>
            </>
          )}
          <span className="sep" />
          <span>{validate ? (validation ?? `Validated with ${check}`) : 'Validation skipped'}</span>
        </>
      )}
    </div>
  )
}