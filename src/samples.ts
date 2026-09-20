export type Language = 'python' | 'go'

// Keep this list in sync with the languages your backend supports.
export const LANGUAGES: Record<Language, { label: string; check: string }> = {
    python: { label: 'Python', check: 'syntax check' },
    go: { label: 'Go', check: 'go vet' },
}

export const LANGUAGE_KEYS = Object.keys(LANGUAGES) as Language[]

// Starter code shown in the editor for each language.
export const SAMPLES: Record<Language, string> = {
    python: [
        'def subset(current: str, text: str, idx: int) -> list[str]:',
        '    if idx == len(text):',
        '        return [current]',
        '    include = subset(current + text[idx], text, idx + 1)',
        '    exclude = subset(current, text, idx + 1)',
        '    return include + exclude',
        '',
    ].join('\n'),
    go: [
        'package practice',
        '',
        'func Subset(current string, str string, idx int) []string {',
        '\tif idx == len(str) {',
        '\t\treturn []string{current}',
        '\t}',
        '\tinclude := Subset(current+string((str[idx])), str, idx+1)',
        '\texclude := Subset(current, str, idx+1)',
        '\treturn append(include, exclude...)',
        '}',
        '',
    ].join('\n'),
}
