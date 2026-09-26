import { useEffect, useRef, useState } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type { ApiRequestError } from '../types/api'
import type { Status } from '../hooks/useTranspile'
import { useMonacoTheme } from '../hooks/useMonacoTheme'
import { findErrorLine } from '../lib/errors'
import { OUTPUT_OPTIONS, defineThemes } from '../lib/monaco'
import { LANGUAGES, type Language } from '../samples'
import { ErrorNotice } from './ErrorNotice'
import { StatusStrip } from './StatusStrip'
import '../styles/panes.css'
import '../styles/OutputPane.css'

type MonacoEditor = Parameters<OnMount>[0]
type MonacoApi = Parameters<OnMount>[1]

const SKELETON_WIDTHS = [70, 45, 88, 60, 0, 52, 80, 38, 66, 30] // 0 = blank gap

interface OutputPaneProps {
  language: Language
  output: string
  status: Status
  error: ApiRequestError | null
  elapsed: number
  cached: boolean | null
  validation: string | null
  validate: boolean
}

export function OutputPane({ language, output, status, error, elapsed, cached, validation, validate }: OutputPaneProps) {
  const theme = useMonacoTheme()
  const [copyLabel, setCopyLabel] = useState('Copy')

  const editorRef = useRef<MonacoEditor | null>(null)
  const monacoRef = useRef<MonacoApi | null>(null)
  const decorations = useRef<ReturnType<MonacoEditor['createDecorationsCollection']> | null>(null)

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
  }

  // Mark the failing line in the output editor when validation fails.
  const errorLine = status === 'failed' && error ? findErrorLine(error.message) : null
  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
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

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output)
      setCopyLabel('Copied')
    } catch {
      setCopyLabel('Copy failed')
    }
    setTimeout(() => setCopyLabel('Copy'), 1600)
  }

  return (
    <section className="pane" aria-labelledby="output-title">
      <div className="pane-head">
        <h2 id="output-title">{LANGUAGES[language].label} output</h2>
        <button type="button" className="ghost" onClick={handleCopy} disabled={!output || status === 'loading'}>
          {copyLabel}
        </button>
      </div>
      <div className={`bar${status === 'loading' ? ' on' : ''}`} />

      {status === 'failed' && error && <ErrorNotice error={error} errorLine={errorLine} hasCode={output !== ''} />}

      <div className="editor-wrap">
        <Editor
          height="100%"
          language={language}
          value={output}
          theme={theme}
          beforeMount={defineThemes}
          onMount={handleMount}
          options={OUTPUT_OPTIONS}
          loading={<div className="editor-loading">Loading editor…</div>}
        />

        {status === 'loading' && (
          <div className="overlay skel" aria-hidden="true">
            {SKELETON_WIDTHS.map((width, i) =>
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

      <StatusStrip
        status={status}
        elapsed={elapsed}
        cached={cached}
        validation={validation}
        validate={validate}
        check={LANGUAGES[language].check}
      />
    </section>
  )
}