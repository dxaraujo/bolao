import { cn } from '@/lib/utils'
import { NAV_TABS } from '@/lib/navigation'
import type { Screen } from '@/types'

interface BottomNavProps {
  active: Screen
  onNav: (s: Screen) => void
}

export function BottomNav({ active, onNav }: BottomNavProps) {
  return (
    <nav
      className="md:hidden sticky bottom-0 z-50 flex safe-area-pb
      border-t border-copa-border dark:border-[#1e2f45]
      bg-copa-bg/95 dark:bg-[#070d18]/95 backdrop-blur-xl"
    >
      {NAV_TABS.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onNav(tab.id)}
            className="flex-1 flex flex-col items-center py-2 pb-3 gap-0.5 transition-colors hover:bg-white/5"
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className={cn(
              'text-[11px] font-semibold tracking-wide transition-colors',
              isActive ? 'text-copa-acc dark:text-[#00e5ff]' : 'text-copa-sub dark:text-[#64849f]'
            )}>
              {tab.label}
            </span>
            {isActive && (
              <div className="w-4 h-0.5 rounded-full bg-copa-acc dark:bg-[#00e5ff] mt-0.5" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
