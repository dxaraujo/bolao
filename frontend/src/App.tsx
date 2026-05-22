import { useCallback, useState } from 'react'
import { clearToken, getToken } from '@/api/client'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { SidebarNav } from '@/components/layout/SidebarNav'
import { AppDataProvider } from '@/context/AppDataContext'
import { useTheme } from '@/hooks/useTheme'
import { LoginScreen } from '@/screens/LoginScreen'
import { HomeScreen } from '@/screens/HomeScreen'
import { BetsScreen } from '@/screens/BetsScreen'
import { BolaoScreen } from '@/screens/BolaoScreen'
import { RankingScreen } from '@/screens/RankingScreen'
import { StatsScreen } from '@/screens/StatsScreen'
import type { Screen } from '@/types'

export default function App() {
  const { isDark, toggle } = useTheme()
  const [auth, setAuth] = useState(!!getToken())
  const [screen, setScreen] = useState<Screen>('home')
  const [navKey, setNavKey] = useState(0)

  const handleLogin = useCallback(() => setAuth(true), [])

  const handleLogout = useCallback(() => {
    clearToken()
    setAuth(false)
    setScreen('home')
  }, [])

  function nav(s: Screen) {
    if (s === screen) return
    setScreen(s)
    setNavKey((k) => k + 1)
  }

  const screens: Record<Screen, React.ReactNode> = {
    home: <HomeScreen onNav={nav} />,
    rank: <RankingScreen />,
    bets: <BetsScreen />,
    bolao: <BolaoScreen />,
    stats: <StatsScreen />,
  }

  if (!auth) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <AppDataProvider enabled={auth}>
      <div className="min-h-screen w-full bg-copa-bg dark:bg-[#040810]">
        <div className="min-h-screen flex w-full max-w-[1600px] mx-auto">
          <SidebarNav active={screen} onNav={nav} onLogout={handleLogout} />
          <div className="flex-1 min-w-0 min-h-screen flex flex-col bg-copa-bg dark:bg-[#070d18]">
            <Header isDark={isDark} onToggle={toggle} screen={screen} onLogout={handleLogout} />
            <main
              key={navKey}
              className="flex-1 flex flex-col overflow-hidden animate-fade-in w-full max-w-5xl mx-auto"
            >
              {screens[screen]}
            </main>
            <BottomNav active={screen} onNav={nav} />
          </div>
        </div>
      </div>
    </AppDataProvider>
  )
}
