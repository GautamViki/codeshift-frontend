import { ApiRequestError, type ApiErrorBody, type TranspileOptions, type TranspileResult } from '../types/api'

const BASE: string = import.meta.env.VITE_API_BASE_URL ?? ''

export function buildQuery(from: string, to: string, opts: TranspileOptions): string {
  const params = new URLSearchParams({ source_language: from, target_language: to })
  if (!opts.validate) params.set('validate_syntax', 'false')
  if (!opts.useCache) params.set('use_cache', 'false')
  return params.toString()
}

async function toApiError(res: Response): Promise<ApiRequestError> {
  try {
    const body: ApiErrorBody = await res.json()
    const fallback = typeof body.detail === 'string' ? body.detail : `Request failed (${res.status}).`
    return new ApiRequestError(body.message ?? fallback, {
      status: res.status,
      code: body.code,
      errorType: body.error_type ?? body.error,
      transpiledCode: body.transpiled_code,
      details: Array.isArray(body.details) ? body.details : undefined,
    })
  } catch {
    return new ApiRequestError(`Request failed (${res.status}).`, { status: res.status })
  }
}

function parseBoolHeader(res: Response, name: string): boolean | null {
  const value = res.headers.get(name)
  return value === null ? null : value === 'true'
}

export async function transpile(
  code: string,
  from: string,
  to: string,
  opts: TranspileOptions,
  signal?: AbortSignal,
): Promise<TranspileResult> {
  let res: Response
  try {
    res = await fetch(`${BASE}/api/v1/transpile-raw?${buildQuery(from, to, opts)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: code,
      signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiRequestError('Cannot reach the server. Check that the API is running on port 8080.')
  }

  if (!res.ok) throw await toApiError(res)

  return {
    code: await res.text(),
    cached: parseBoolHeader(res, 'x-cached'),
    validation: res.headers.get('x-validation') || null,
  }
}