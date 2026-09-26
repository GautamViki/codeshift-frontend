// Everything that talks to the FastAPI backend lives in this file.

export interface TranspileOptions {
    validate: boolean
    useCache: boolean
}

export interface TranspileResult {
    code: string
    /** true/false when the backend sends an X-Cached header, otherwise null (unknown). */
    cached: boolean | null
    /** The backend's validation message when it sends an X-Validation header. */
    validation: string | null
}

interface ErrorDetail {
    field: string
    message: string
}

/** An error returned by the API (or a failure to reach it). */
export class ApiRequestError extends Error {
    status: number
    code?: number
    errorType?: string
    transpiledCode?: string
    details?: ErrorDetail[]

    constructor(
        message: string,
        init: {
            status?: number
            code?: number
            errorType?: string
            transpiledCode?: string
            details?: ErrorDetail[]
        } = {},
    ) {
        super(message)
        this.name = 'ApiRequestError'
        this.status = init.status ?? 0
        this.code = init.code
        this.errorType = init.errorType
        this.transpiledCode = init.transpiledCode
        this.details = init.details
    }
}

const BASE: string = import.meta.env.VITE_API_BASE_URL ?? ''

export function buildQuery(from: string, to: string, opts: TranspileOptions): string {
    const params = new URLSearchParams({ source_language: from, target_language: to })
    if (!opts.validate) params.set('validate_syntax', 'false')
    if (!opts.useCache) params.set('use_cache', 'false')
    return params.toString()
}

async function toApiError(res: Response): Promise<ApiRequestError> {
    try {
        const body = await res.json()
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

    const cached = res.headers.get('x-cached')
    return {
        code: await res.text(),
        cached: cached === null ? null : cached === 'true',
        validation: res.headers.get('x-validation') || null,
    }
}
