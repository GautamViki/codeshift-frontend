import { useState } from 'react'
import { buildQuery } from './api/transpile'
import { LanguagePair } from './components/LanguagePair'
import { OutputPane } from './components/OutputPane'
import { SourcePane } from './components/SourcePane'
import { useTranspile } from './hooks/useTranspile'
import { SAMPLES, type Language } from './samples'
import './styles/panes.css'
import './App.css'

export default function App() {
  const [from, setFrom] = useState<Language>('go')
  const [to, setTo] = useState<Language>('python')
  const [source, setSource] = useState(SAMPLES.go)
  const [validate, setValidate] = useState(true)
  const [useCache, setUseCache] = useState(true)

  const { status, output, error, elapsed, cached, validation, run, reset } = useTranspile()

  const sameLanguage = from === to
  const canRun = source.trim().length > 0 && !sameLanguage && status !== 'loading'

  function handleTranspile() {
    if (canRun) run(source, from, to, { validate, useCache })
  }

  function changeLanguages(nextFrom: Language, nextTo: Language, carry: string | null = null) {
    if (carry !== null) setSource(carry)
    else if (nextFrom !== from && source === SAMPLES[from]) setSource(SAMPLES[nextFrom])
    setFrom(nextFrom)
    setTo(nextTo)
    reset()
  }

  function handleSwap() {
    // If there is a finished result, it becomes the new source.
    changeLanguages(to, from, status === 'done' && output ? output : null)
  }

  return (
    <main className="app">
      <header className="top">
        <h1 className="brand">CodeShift</h1>
        <p className="tagline">Convert code between languages, then check that it compiles.</p>
      </header>

      <section className="route" aria-label="Conversion settings">
        <LanguagePair
          from={from}
          to={to}
          onFromChange={(language) => changeLanguages(language, to)}
          onToChange={(language) => changeLanguages(from, language)}
          onSwap={handleSwap}
        />

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

      {sameLanguage && <p className="inline-err" role="alert">Choose two different languages to convert between.</p>}
      <p className="req">
        <code>POST /api/v1/transpile-raw?{buildQuery(from, to, { validate, useCache })}</code>
      </p>

      <div className="panes">
        <SourcePane language={from} value={source} onChange={setSource} onRun={handleTranspile} />
        <OutputPane
          language={to}
          output={output}
          status={status}
          error={error}
          elapsed={elapsed}
          cached={cached}
          validation={validation}
          validate={validate}
        />
      </div>
    </main>
  )
}