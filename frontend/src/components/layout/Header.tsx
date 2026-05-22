import { Sun, Moon, LogOut } from 'lucide-react'
import { useAppData } from '@/context/AppDataContext'
import { Avatar } from '@/components/shared/Avatar'
import { NAV_TABS } from '@/lib/navigation'
import type { Screen } from '@/types'

const SCREEN_TITLES: Record<Screen, string> = Object.fromEntries(
  NAV_TABS.map((t) => [t.id, t.label]),
) as Record<Screen, string>

interface HeaderProps {
  isDark: boolean
  onToggle: () => void
  onLogout: () => void
  screen?: Screen
}

export function Header({ isDark, onToggle, onLogout, screen = 'home' }: HeaderProps) {
  const screenTitle = SCREEN_TITLES[screen]
  const { me, loading, updatingScores } = useAppData()

  return (
    <header
      className="sticky top-0 z-50 px-4 sm:px-5 lg:px-8 py-3 sm:py-4 flex items-center justify-between
      bg-gradient-to-b from-copa-bg2 dark:from-[#0d1526] to-transparent
      dark:border-b dark:border-[#1e2f45] border-b border-copa-border"
    >
      <div>
        <h1 className="md:hidden font-display text-2xl leading-none tracking-wider text-copa-text dark:text-[#f0f6ff]">
          COPA<span className="text-copa-acc dark:text-[#00e5ff]">BET</span>
          <span className="ml-2 text-xs font-sans font-normal text-copa-sub dark:text-[#64849f] tracking-normal">
            2026
          </span>
        </h1>
        <p className="hidden md:block text-sm font-semibold text-copa-text dark:text-[#f0f6ff] capitalize">
          {screenTitle}
        </p>
        {updatingScores && (
          <p className="text-[11px] text-amber-400 mt-0.5">Atualizando placares…</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onLogout}
          className="h-8 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5
            border border-copa-border dark:border-[#1e2f45]
            bg-copa-surface dark:bg-[#111d2e]
            text-copa-sub dark:text-[#64849f]
            hover:bg-copa-surf2 dark:hover:bg-[#172438] hover:text-red-400 transition-colors"
          aria-label="Sair"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline text-xs font-semibold">Sair</span>
        </button>
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-xl flex items-center justify-center
            border border-copa-border dark:border-[#1e2f45]
            bg-copa-surface dark:bg-[#111d2e]
            text-copa-sub dark:text-[#64849f]
            hover:bg-copa-surf2 dark:hover:bg-[#172438] transition-colors"
          aria-label="Alternar tema"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        {me && !loading ? <Avatar user={me} size="sm" /> : (
          <div className="w-7 h-7 rounded-full bg-copa-muted dark:bg-[#243347] animate-pulse" />
        )}
      </div>
    </header>
  )
}
