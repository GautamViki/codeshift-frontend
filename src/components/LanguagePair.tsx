import { LANGUAGES, LANGUAGE_KEYS, type Language } from '../samples'
import '../styles/LanguagePair.css'

interface LanguagePairProps {
  from: Language
  to: Language
  onFromChange: (language: Language) => void
  onToChange: (language: Language) => void
  onSwap: () => void
}

export function LanguagePair({ from, to, onFromChange, onToChange, onSwap }: LanguagePairProps) {
  return (
    <div className="pair">
      <label className="sel">
        <span className="sr">Convert from</span>
        <select value={from} onChange={(e) => onFromChange(e.target.value as Language)}>
          {LANGUAGE_KEYS.map((key) => (
            <option key={key} value={key}>{LANGUAGES[key].label}</option>
          ))}
        </select>
      </label>

      <button type="button" className="swap" onClick={onSwap} aria-label="Swap languages">
        &#8644;
      </button>

      <label className="sel">
        <span className="sr">Convert to</span>
        <select value={to} onChange={(e) => onToChange(e.target.value as Language)}>
          {LANGUAGE_KEYS.map((key) => (
            <option key={key} value={key}>{LANGUAGES[key].label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}