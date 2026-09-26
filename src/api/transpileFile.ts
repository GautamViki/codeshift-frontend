import { ApiRequestError, type TranspileFileOptions, type TranspileFileResult } from '../types/api'
const BASE: string = import.meta.env.VITE_API_BASE_URL ?? ''

export async function transpileFile(
    file: File,
    opts: TranspileFileOptions,
    signal?: AbortSignal,
): Promise<TranspileFileResult> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('target_language', opts.targetLanguage)
    formData.append('use_cache', String(opts.useCache))

    let res: Response
    try {
        res = await fetch(`${BASE}/api/v1/transpile-file`, {
            method: 'POST',
            body: formData,
            signal,
        })
    } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') throw e
        throw new ApiRequestError('Cannot reach the server. Check that the API is running on port 8080.')
    }

    if (!res.ok) {
        try {
            const body = await res.json()
            const fallback = typeof body.detail === 'string' ? body.detail : `Request failed (${res.status}).`
            throw new ApiRequestError(body.message ?? fallback, {
                status: res.status,
                code: body.code,
                errorType: body.error_type ?? body.error,
                transpiledCode: body.transpiled_code,
                details: Array.isArray(body.details) ? body.details : undefined,
            })
        } catch (err) {
            if (err instanceof ApiRequestError) throw err
            throw new ApiRequestError(`Request failed (${res.status}).`, { status: res.status })
        }
    }

    const body = await res.json()
    return {
        success: body.success,
        filename: body.filename,
        savedPath: body.saved_path,
        validationMessage: body.validation_message,
        cached: body.cached,
    }
}
