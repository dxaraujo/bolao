import { useState, useEffect } from 'react'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('copabet-theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    localStorage.setItem('copabet-theme', isDark ? 'dark' : 'light')
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark ? '#070d18' : '#eef3f9')
  }, [isDark])

  return { isDark, toggle: () => setIsDark(d => !d) }
}
