import { useEffect, useRef, useState } from 'react'
import Editor, { type BeforeMount, type EditorProps, type OnMount } from '@monaco-editor/react'
import { ApiRequestError, buildQuery, transpile } from './api/transpile'
import { LANGUAGES, LANGUAGE_KEYS, SAMPLES, type Language } from './samples'
import './App.css'

type Status = 'idle' | 'loading' | 'done' | 'failed'
type MonacoEditor = Parameters<OnMount>[0]
type MonacoApi = Parameters<OnMount>[1]

const EDITOR_OPTIONS: NonNullable<EditorProps['options']> = {
  minimap: { enabled: false },
  fontSize: 13.5,
  lineHeight: 20,
  fontFamily: '"Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 12, bottom: 12 },
  renderLineHighlight: 'none',
  tabSize: 4,
  wordWrap: 'off',
}

const OUTPUT_OPTIONS: NonNullable<EditorProps['options']> = {
  ...EDITOR_OPTIONS,
  readOnly: true,
  domReadOnly: true,
}

// Editor colours that match the page (see :root in index.css).
const defineThemes: BeforeMount = (monaco) => {
  monaco.editor.defineTheme('codeshift-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#141C26',
      'editorLineNumber.foreground': '#5A6879',
      'editorLineNumber.activeForeground': '#141C26',
    },
  })
  monaco.editor.defineTheme('codeshift-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#151B23',
      'editor.foreground': '#E4EAF1',
      'editorLineNumber.foreground': '#8B98A8',
      'editorLineNumber.activeForeground': '#E4EAF1',
    },
  })
}

function usePrefersDark(): boolean {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return dark
}

// "main.go:69:4: declared and not used" -> 69
function findErrorLine(message: string): number | null {
  const match = message.match(/main\.\w+:(\d+)/)
  return match ? Number(match[1]) : null
}

function errorTitle(error: ApiRequestError): string {
  if (error.errorType === 'CODE_VALIDATION_FAILED') return 'Validation failed'
  if (error.status === 0) return 'Server unreachable'
  return 'Request failed'
}

export default function App() {
  const dark = usePrefersDark()

  const [from, setFrom] = useState<Language>('go')
  const [to, setTo] = useState<Language>('python')
  const [source, setSource] = useState(SAMPLES.go)
  const [validate, setValidate] = useState(true)
  const [useCache, setUseCache] = useState(true)

  const [status, setStatus] = useState<Status>('idle')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<ApiRequestError | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [cached, setCached] = useState<boolean | null>(null)
  const [validation, setValidation] = useState<string | null>(null)
  const [copyLabel, setCopyLabel] = useState('Copy')

  const outputEditor = useRef<MonacoEditor | null>(null)
  const outputMonaco = useRef<MonacoApi | null>(null)
  const decorations = useRef<ReturnType<MonacoEditor['createDecorationsCollection']> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const runRef = useRef<() => void>(() => { })

  const sameLanguage = from === to
  const canRun = source.trim().length > 0 && !sameLanguage && status !== 'loading'

  async function handleTranspile() {
    if (!canRun) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('loading')
    setError(null)
    const started = performance.now()

    try {
      const result = await transpile(source, from, to, { validate, useCache }, controller.signal)
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
  }

  // Lets the editor's Ctrl/Cmd+Enter shortcut call the latest version of handleTranspile.
  useEffect(() => {
    runRef.current = handleTranspile
  })

  function changeLanguages(nextFrom: Language, nextTo: Language, carry: string | null = null) {
    abortRef.current?.abort()
    if (carry !== null) setSource(carry)
    else if (nextFrom !== from && source === SAMPLES[from]) setSource(SAMPLES[nextFrom])
    setFrom(nextFrom)
    setTo(nextTo)
    setStatus('idle')
    setOutput('')
    setError(null)
  }

  function handleSwap() {
    // If there is a finished result, it becomes the new source.
    changeLanguages(to, from, status === 'done' && output ? output : null)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output)
      setCopyLabel('Copied')
    } catch {
      setCopyLabel('Copy failed')
    }
    setTimeout(() => setCopyLabel('Copy'), 1600)
  }

  const handleSourceMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current())
  }

  const handleOutputMount: OnMount = (editor, monaco) => {
    outputEditor.current = editor
    outputMonaco.current = monaco
  }

  // Mark the failing line in the output editor when validation fails.
  const errorLine = status === 'failed' && error ? findErrorLine(error.message) : null
  useEffect(() => {
    const editor = outputEditor.current
    const monaco = outputMonaco.current
    if (!editor || !monaco) return
    decorations.current?.clear()
    decorations.current = null
    if (errorLine) {
      decorations.current = editor.createDecorationsCollection([
        {
          range: new monaco.Range(errorLine, 1, errorLine, 1),
          options: { isWholeLine: true, className: 'error-line' },
        },
      ])
      editor.revealLineInCenterIfOutsideViewport(errorLine)
    }
  }, [errorLine, output])

  const theme = dark ? 'codeshift-dark' : 'codeshift-light'
  const requestLine = `POST /api/v1/transpile-raw?${buildQuery(from, to, { validate, useCache })}`
  const lineCount = source.split('\n').length
  const byteCount = new TextEncoder().encode(source).length
  const errorText = error ? (error.details?.length ? error.details.map((d) => d.message).join(' ') : error.message) : ''
  const elapsedText = elapsed < 0.1 ? 'under 0.1 s' : `${elapsed.toFixed(1)} s`

  return (
    <main className="app">
      <header className="top">
        <h1 className="brand">CodeShift</h1>
        <p className="tagline">Convert code between languages, then check that it compiles.</p>
      </header>

      <section className="route" aria-label="Conversion settings">
        <div className="pair">
          <label className="sel">
            <span className="sr">Convert from</span>
            <select value={from} onChange={(e) => changeLanguages(e.target.value as Language, to)}>
              {LANGUAGE_KEYS.map((key) => (
                <option key={key} value={key}>{LANGUAGES[key].label}</option>
              ))}
            </select>
          </label>
          <button type="button" className="swap" onClick={handleSwap} aria-label="Swap languages">
            &#8644;
          </button>
          <label className="sel">
            <span className="sr">Convert to</span>
            <select value={to} onChange={(e) => changeLanguages(from, e.target.value as Language)}>
              {LANGUAGE_KEYS.map((key) => (
                <option key={key} value={key}>{LANGUAGES[key].label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="opts">
          <label className="chk">
            <input type="checkbox" checked={validate} onChange={(e) => setValidate(e.target.checked)} />
            Validate output
          </label>
          <label className="chk">
            <input type="checkbox" checked={useCache} onChange={(e) => setUseCache(e.target.checked)} />
            Use cache
          </label>
        </div>

        <button type="button" className="run" onClick={handleTranspile} disabled={!canRun} title="Ctrl or Cmd + Enter">
          {status === 'loading' ? 'Transpiling…' : 'Transpile'}
        </button>
      </section>

      {sameLanguage && (
        <p className="inline-err" role="alert">Choose two different languages to convert between.</p>
      )}
      <p className="req"><code>{requestLine}</code></p>

      <div className="panes">
        <section className="pane" aria-labelledby="source-title">
          <div className="pane-head">
            <h2 id="source-title">{LANGUAGES[from].label} source</h2>
            <span className="meta">
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}, {byteCount.toLocaleString()} bytes
            </span>
          </div>
          <div className="editor-wrap">
            <Editor
              height="100%"
              language={from}
              value={source}
              onChange={(value) => setSource(value ?? '')}
              theme={theme}
              beforeMount={defineThemes}
              onMount={handleSourceMount}
              options={EDITOR_OPTIONS}
              loading={<div className="editor-loading">Loading editor…</div>}
            />
          </div>
        </section>

        <section className="pane" aria-labelledby="output-title">
          <div className="pane-head">
            <h2 id="output-title">{LANGUAGES[to].label} output</h2>
            <button type="button" className="ghost" onClick={handleCopy} disabled={!output || status === 'loading'}>
              {copyLabel}
            </button>
          </div>
          <div className={`bar${status === 'loading' ? ' on' : ''}`} />

          {status === 'failed' && error && (
            <div className="notice" role="alert">
              <strong>{errorTitle(error)}</strong>
              {error.errorType && <code>{error.code ? `${error.code} ` : ''}{error.errorType}</code>}
              <code>{errorText}</code>
              {output && (
                <span>
                  The generated code is below{errorLine ? ' with the failing line marked' : ''}, so you can fix it by hand.
                </span>
              )}
            </div>
          )}

          <div className="editor-wrap">
            <Editor
              height="100%"
              language={to}
              value={output}
              theme={theme}
              beforeMount={defineThemes}
              onMount={handleOutputMount}
              options={OUTPUT_OPTIONS}
              loading={<div className="editor-loading">Loading editor…</div>}
            />
            {status === 'loading' && (
              <div className="overlay skel" aria-hidden="true">
                {[70, 45, 88, 60, 0, 52, 80, 38, 66, 30].map((width, i) =>
                  width ? <i key={i} style={{ width: `${width}%` }} /> : <i key={i} className="gap" />,
                )}
              </div>
            )}
            {status !== 'loading' && !output && (
              <div className="overlay">
                {status === 'failed' ? (
                  <>
                    <strong>No code was returned</strong>
                    <span>Read the message above, adjust the input, and try again.</span>
                  </>
                ) : (
                  <>
                    <strong>Nothing here yet</strong>
                    <span>Paste code on the left, then choose Transpile.</span>
                  </>
                )}
              </div>
            )}
          </div>

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
                <span className="bad">Failed after {elapsedText}</span>
              </>
            )}
            {status === 'done' && (
              <>
                <span className={`dot${validate ? ' ok' : ''}`} />
                <span className="good">Done in {elapsedText}</span>
                {cached !== null && (
                  <>
                    <span className="sep" />
                    <span>{cached ? 'Served from cache' : 'Fresh result'}</span>
                  </>
                )}
                <span className="sep" />
                <span>{validate ? (validation ?? `Validated with ${LANGUAGES[to].check}`) : 'Validation skipped'}</span>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
