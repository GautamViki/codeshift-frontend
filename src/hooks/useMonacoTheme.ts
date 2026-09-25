import { useEffect, useState } from 'react'

const QUERY = '(prefers-color-scheme: dark)'

/** Returns the Monaco theme name that matches the user's light/dark setting. */
export function useMonacoTheme(): 'codeshift-dark' | 'codeshift-light' {
  const [dark, setDark] = useState(() => window.matchMedia(QUERY).matches)

  useEffect(() => {
    const query = window.matchMedia(QUERY)
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return dark ? 'codeshift-dark' : 'codeshift-light'
}