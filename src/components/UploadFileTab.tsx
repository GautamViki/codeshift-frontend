import { useState } from 'react'
import { useTranspileFile } from '../hooks/useTranspileFile'
import { LANGUAGES, LANGUAGE_KEYS, type Language } from '../samples'
import { FileUploadPane } from './FileUploadPane'
import { FileOutputPane } from './FileOutputPane'

export function UploadFileTab() {
  const [fileTo, setFileTo] = useState<Language>('go')
  const [fileUseCache, setFileUseCache] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { status, result, error, elapsed, run } = useTranspileFile()

  const canRun = selectedFile !== null && status !== 'loading'

  function handleTranspileFile() {
    if (canRun && selectedFile) {
      run(selectedFile, { targetLanguage: fileTo, useCache: fileUseCache })
    }
  }

  return (
    <>
      <section className="route" aria-label="File conversion settings">
        <div className="file-target-sel">
          <span className="file-label">Target language</span>
          <label className="sel">
            <span className="sr">Convert to</span>
            <select value={fileTo} onChange={(e) => setFileTo(e.target.value as Language)}>
              {LANGUAGE_KEYS.map((key) => (
                <option key={key} value={key}>{LANGUAGES[key].label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="opts">
          <label className="chk">
            <input type="checkbox" checked={fileUseCache} onChange={(e) => setFileUseCache(e.target.checked)} />
            Use cache
          </label>
        </div>

        <button type="button" className="run" onClick={handleTranspileFile} disabled={!canRun}>
          {status === 'loading' ? 'Transpiling…' : 'Transpile'}
        </button>
      </section>

      <p className="req">
        <code>POST /api/v1/transpile-file</code>
      </p>

      <div className="panes">
        <FileUploadPane file={selectedFile} onChange={setSelectedFile} />
        <FileOutputPane
          status={status}
          result={result}
          error={error}
          elapsed={elapsed}
        />
      </div>
    </>
  )
}