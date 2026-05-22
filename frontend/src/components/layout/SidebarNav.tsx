import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_TABS } from '@/lib/navigation'
import type { Screen } from '@/types'

interface SidebarNavProps {
  active: Screen
  onNav: (s: Screen) => void
  onLogout: () => void
}

export function SidebarNav({ active, onNav, onLogout }: SidebarNavProps) {
  return (
    <aside
      className="hidden md:flex flex-col w-56 lg:w-64 flex-shrink-0
        border-r border-copa-border dark:border-[#1e2f45]
        bg-copa-surface dark:bg-[#0d1526]"
    >
      <div className="px-5 py-5 border-b border-copa-border dark:border-[#1e2f45]">
        <h1 className="font-display text-2xl leading-none tracking-wider text-copa-text dark:text-[#f0f6ff]">
          COPA<span className="text-copa-acc dark:text-[#00e5ff]">BET</span>
        </h1>
        <p className="text-[10px] text-copa-sub dark:text-[#64849f] mt-1 tracking-widest uppercase">
          Copa 2026
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV_TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onNav(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-[#00e5ff]/15 text-copa-acc dark:text-[#00e5ff]'
                  : 'text-copa-sub dark:text-[#64849f] hover:bg-copa-surf2 dark:hover:bg-[#172438]',
              )}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </nav>
      <div className="p-3 border-t border-copa-border dark:border-[#1e2f45]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
            text-copa-sub dark:text-[#64849f]
            hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}
