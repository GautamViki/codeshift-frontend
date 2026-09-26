export type TabMode = 'paste' | 'file'

interface TabSwitcherProps {
  active: TabMode
  onChange: (tab: TabMode) => void
}

export function TabSwitcher({ active, onChange }: TabSwitcherProps) {
  return (
    <div className="tabs" role="tablist" aria-label="Input mode">
      <button
        role="tab"
        type="button"
        className={`tab${active === 'paste' ? ' active' : ''}`}
        aria-selected={active === 'paste'}
        onClick={() => onChange('paste')}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 2H10L13 5V14H3V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M5 8H11M5 10.5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Paste Code
      </button>

      <button
        role="tab"
        type="button"
        className={`tab${active === 'file' ? ' active' : ''}`}
        aria-selected={active === 'file'}
        onClick={() => onChange('file')}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 10V4M8 4L5.5 6.5M8 4L10.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.5 10V12.5C2.5 13.0523 2.94772 13.5 3.5 13.5H12.5C13.0523 13.5 13.5 13.0523 13.5 12.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Upload File
      </button>
    </div>
  )
}