export interface TranspileOptions {
  validate: boolean
  useCache: boolean
}

export interface TranspileResult {
  code: string
  cached: boolean | null
  validation: string | null
}

export interface ErrorDetail {
  field: string
  message: string
}

/** Shape of the JSON body our FastAPI error handlers return. */
export interface ApiErrorBody {
  message?: string
  detail?: string
  code?: number
  error_type?: string
  error?: string
  transpiled_code?: string
  details?: ErrorDetail[]
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


export interface TranspileFileOptions {
    targetLanguage: string
    useCache: boolean
}

export interface TranspileFileResult {
    success: boolean
    filename: string
    savedPath: string
    validationMessage: string
    cached: boolean
}
