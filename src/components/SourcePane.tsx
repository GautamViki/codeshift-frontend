import { useEffect, useRef } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import { useMonacoTheme } from '../hooks/useMonacoTheme'
import { EDITOR_OPTIONS, defineThemes } from '../lib/monaco'
import { LANGUAGES, type Language } from '../samples'
import '../styles/panes.css'

interface SourcePaneProps {
  language: Language
  value: string
  onChange: (value: string) => void
  /** Called on Ctrl/Cmd + Enter inside the editor. */
  onRun: () => void
}

export function SourcePane({ language, value, onChange, onRun }: SourcePaneProps) {
  const theme = useMonacoTheme()

  // The editor shortcut is registered once, so it reads the latest onRun through a ref.
  const onRunRef = useRef(onRun)
  useEffect(() => {
    onRunRef.current = onRun
  })

  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => onRunRef.current())
  }

  const lineCount = value.split('\n').length
  const byteCount = new TextEncoder().encode(value).length

  return (
    <section className="pane" aria-labelledby="source-title">
      <div className="pane-head">
        <h2 id="source-title">{LANGUAGES[language].label} source</h2>
        <span className="meta">
          {lineCount} {lineCount === 1 ? 'line' : 'lines'}, {byteCount.toLocaleString()} bytes
        </span>
      </div>
      <div className="editor-wrap">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={(next) => onChange(next ?? '')}
          theme={theme}
          beforeMount={defineThemes}
          onMount={handleMount}
          options={EDITOR_OPTIONS}
          loading={<div className="editor-loading">Loading editor…</div>}
        />
      </div>
    </section>
  )
}