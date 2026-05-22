import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'

type Theme = 'dark' | 'light'
const STORAGE_KEY = 'copabet.theme'

interface ThemeContextValue {
	theme: Theme
	isDark: boolean
	toggle: () => void
	setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function readInitial(): Theme {
	const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
	if (stored === 'dark' || stored === 'light') return stored
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: PropsWithChildren) {
	const [theme, setThemeState] = useState<Theme>(readInitial)

	useEffect(() => {
		document.documentElement.classList.toggle('dark', theme === 'dark')
		localStorage.setItem(STORAGE_KEY, theme)
	}, [theme])

	const setTheme = useCallback((t: Theme) => setThemeState(t), [])
	const toggle = useCallback(() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')), [])

	const value = useMemo<ThemeContextValue>(
		() => ({ theme, isDark: theme === 'dark', toggle, setTheme }),
		[theme, toggle, setTheme],
	)

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
	const ctx = useContext(ThemeContext)
	if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
	return ctx
}
