import { useState } from 'react'
import { TabSwitcher, type TabMode } from './components/TabSwitcher'
import { PasteCodeTab } from './components/PasteCodeTab'
import { UploadFileTab } from './components/UploadFileTab'
import './styles/panes.css'
import './App.css'

export default function App() {
  const [tab, setTab] = useState<TabMode>('paste')

  return (
    <main className="app">
      <header className="top">
        <h1 className="brand">CodeShift</h1>
        <p className="tagline">Convert code between languages, then check that it compiles.</p>
      </header>

      <TabSwitcher active={tab} onChange={setTab} />

      {tab === 'paste' && <PasteCodeTab />}
      {tab === 'file' && <UploadFileTab />}
    </main>
  )
}