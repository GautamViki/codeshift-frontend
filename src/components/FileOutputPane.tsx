import type { ApiRequestError, TranspileFileResult } from '../types/api'
import type { FileStatus } from '../hooks/useTranspileFile'
import { ErrorNotice } from './ErrorNotice'
import '../styles/FileOutputPane.css'
import '../styles/panes.css'

const SKELETON_WIDTHS = [70, 45, 88, 60, 0, 52, 80, 38] // 0 = blank gap

interface FileOutputPaneProps {
  status: FileStatus
  result: TranspileFileResult | null
  error: ApiRequestError | null
  elapsed: number
}

function formatSeconds(seconds: number): string {
  return seconds < 0.1 ? 'under 0.1 s' : `${seconds.toFixed(1)} s`
}

export function FileOutputPane({ status, result, error, elapsed }: FileOutputPaneProps) {
  return (
    <section className="pane" aria-labelledby="file-output-title">
      <div className="pane-head">
        <h2 id="file-output-title">Transpile result</h2>
      </div>
      <div className={`bar${status === 'loading' ? ' on' : ''}`} />

      {status === 'failed' && error && <ErrorNotice error={error} errorLine={null} hasCode={false} />}

      <div className="file-output-body">
        {status === 'loading' && (
          <div className="fo-skeleton" aria-hidden="true">
            {SKELETON_WIDTHS.map((width, i) =>
              width ? <i key={i} style={{ width: `${width}%` }} /> : <i key={i} className="gap" />,
            )}
          </div>
        )}

        {status === 'idle' && (
          <div className="fo-empty">
            <strong>Nothing here yet</strong>
            <span>Upload a file on the left, then choose Transpile.</span>
          </div>
        )}

        {status === 'done' && result && (
          <div className="fo-result">
            <div className="fo-card success">
              <div className="fo-check-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.5"/>
                  <path d="M13 20L18 25L27 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="fo-card-body">
                <strong className="fo-filename">{result.filename}</strong>
                <span className="fo-validation">{result.validationMessage}</span>
              </div>
            </div>

            <div className="fo-meta-grid">
              <div className="fo-meta-item">
                <span className="fo-meta-label">Saved to</span>
                <code className="fo-meta-value">{result.savedPath}</code>
              </div>
              <div className="fo-meta-item">
                <span className="fo-meta-label">Cached</span>
                <span className="fo-meta-value">{result.cached ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        )}

        {status === 'failed' && !error && (
          <div className="fo-empty">
            <strong>No result</strong>
            <span>Read the message above, adjust the input, and try again.</span>
          </div>
        )}
      </div>

      {/* Status strip — mirrors the pattern from the raw transpile tab */}
      <div className="status" role="status" aria-live="polite">
        {status === 'idle' && (
          <>
            <span className="dot" />
            <span>Result appears here after you transpile a file.</span>
          </>
        )}
        {status === 'loading' && (
          <>
            <span className="dot pulse" />
            <span>Uploading and transpiling…</span>
          </>
        )}
        {status === 'failed' && (
          <>
            <span className="dot bad" />
            <span className="bad">Failed after {formatSeconds(elapsed)}</span>
          </>
        )}
        {status === 'done' && result && (
          <>
            <span className="dot ok" />
            <span className="good">Done in {formatSeconds(elapsed)}</span>
            <span className="sep" />
            <span>{result.cached ? 'Served from cache' : 'Fresh result'}</span>
            <span className="sep" />
            <span>{result.validationMessage}</span>
          </>
        )}
      </div>
    </section>
  )
}
