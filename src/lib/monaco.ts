import type { BeforeMount, EditorProps } from '@monaco-editor/react'

type EditorOptions = NonNullable<EditorProps['options']>

export const EDITOR_OPTIONS: EditorOptions = {
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

export const OUTPUT_OPTIONS: EditorOptions = {
  ...EDITOR_OPTIONS,
  readOnly: true,
  domReadOnly: true,
}

// Editor colours that match the page (see :root in index.css).
export const defineThemes: BeforeMount = (monaco) => {
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