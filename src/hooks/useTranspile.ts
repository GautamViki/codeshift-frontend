import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiRequestError, type TranspileOptions } from '../types/api'
import { transpile } from '../api/transpile'

export type Status = 'idle' | 'loading' | 'done' | 'failed'

/** State and logic for one transpile request at a time. */
export function useTranspile() {
  const [status, setStatus] = useState<Status>('idle')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<ApiRequestError | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [cached, setCached] = useState<boolean | null>(null)
  const [validation, setValidation] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Cancel any request that is still running when the component goes away.
  useEffect(() => () => abortRef.current?.abort(), [])

  const run = useCallback(async (source: string, from: string, to: string, options: TranspileOptions) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('loading')
    setError(null)
    const started = performance.now()

    try {
      const result = await transpile(source, from, to, options, controller.signal)
      setOutput(result.code)
      setCached(result.cached)
      setValidation(result.validation)
      setStatus('done')
    } catch (e) {
      if (controller.signal.aborted) return
      const err = e instanceof ApiRequestError ? e : new ApiRequestError('Something went wrong. Please try again.')
      setError(err)
      setOutput(err.transpiledCode ?? '')
      setStatus('failed')
    } finally {
      if (!controller.signal.aborted) setElapsed((performance.now() - started) / 1000)
    }
  }, [])

  /** Cancel the running request and clear the result. */
  const reset = useCallback(() => {
    abortRef.current?.abort()
    setStatus('idle')
    setOutput('')
    setError(null)
  }, [])

  return { status, output, error, elapsed, cached, validation, run, reset }
}