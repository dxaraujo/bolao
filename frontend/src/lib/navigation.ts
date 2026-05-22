import type { Screen } from '@/types'

export const NAV_TABS = [
  { id: 'home' as Screen, icon: '⚽', label: 'Jogos' },
  { id: 'rank' as Screen, icon: '🏆', label: 'Ranking' },
  { id: 'bets' as Screen, icon: '🎯', label: 'Apostas' },
  { id: 'bolao' as Screen, icon: '👥', label: 'Bolão' },
  { id: 'stats' as Screen, icon: '📊', label: 'Stats' },
] as const
