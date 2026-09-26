import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiRequestError, type TranspileFileOptions, type TranspileFileResult  } from '../types/api'
import { transpileFile } from '../api/transpileFile'

export type FileStatus = 'idle' | 'loading' | 'done' | 'failed'

/** State and logic for one file-transpile request at a time. */
export function useTranspileFile() {
  const [status, setStatus] = useState<FileStatus>('idle')
  const [result, setResult] = useState<TranspileFileResult | null>(null)
  const [error, setError] = useState<ApiRequestError | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  // Cancel any request that is still running when the component goes away.
  useEffect(() => () => abortRef.current?.abort(), [])

  const run = useCallback(async (file: File, options: TranspileFileOptions) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('loading')
    setError(null)
    setResult(null)
    const started = performance.now()

    try {
      const res = await transpileFile(file, options, controller.signal)
      setResult(res)
      setStatus('done')
    } catch (e) {
      if (controller.signal.aborted) return
      const err = e instanceof ApiRequestError ? e : new ApiRequestError('Something went wrong. Please try again.')
      setError(err)
      setStatus('failed')
    } finally {
      if (!controller.signal.aborted) setElapsed((performance.now() - started) / 1000)
    }
  }, [])

  /** Cancel the running request and clear the result. */
  const reset = useCallback(() => {
    abortRef.current?.abort()
    setStatus('idle')
    setResult(null)
    setError(null)
  }, [])

  return { status, result, error, elapsed, run, reset }
}
