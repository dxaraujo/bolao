import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api } from '@/api/client'
import type { ApiBet } from '@/api/types'
import {
  buildMyBetsMap,
  buildMyOpenBets,
  mapMatch,
  mapStage,
  mapUser,
  sortStages,
} from '@/lib/mappers'
import type { BetMap, Match, Stage, User } from '@/types'

interface AppDataContextValue {
  me: User | null
  users: User[]
  stages: Stage[]
  matches: Match[]
  /** Palpites do usuário logado em fases bloqueadas/finalizadas (com placar). */
  myBets: BetMap
  /** Resposta bruta de GET /api/bet — apenas apostas do usuário logado. */
  myApiBets: ApiBet[]
  myOpenBets: Record<string, { betId: string; bet: import('@/types').Bet }>
  loading: boolean
  error: string | null
  updatingScores: boolean
  refresh: () => Promise<void>
  refreshBets: () => Promise<void>
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({
  children,
  enabled,
}: {
  children: ReactNode
  enabled: boolean
}) {
  const [me, setMe] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [stages, setStages] = useState<Stage[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [myBets, setMyBets] = useState<BetMap>({})
  const [myApiBets, setMyApiBets] = useState<ApiBet[]>([])
  const [myOpenBets, setMyOpenBets] = useState<Record<string, { betId: string; bet: import('@/types').Bet }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingScores, setUpdatingScores] = useState(false)

  const loadBets = useCallback(async (myId: string) => {
    const betsRaw = await api.getBets()
    setMyApiBets(betsRaw)
    setMyBets(buildMyBetsMap(betsRaw, myId))
    setMyOpenBets(buildMyOpenBets(betsRaw, myId))
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [meRaw, usersRaw, stagesRaw, matchesRaw, configRaw] = await Promise.all([
        api.getMe(),
        api.getActiveUsers(),
        api.getStages(),
        api.getMatches(),
        api.getConfig(),
      ])

      const mappedMe = mapUser(meRaw)
      const mappedUsers = usersRaw.map(mapUser).sort((a, b) => b.pts - a.pts)
      const mappedStages = sortStages(stagesRaw.map(mapStage))
      const mappedMatches = matchesRaw.map(mapMatch)

      setMe(mappedMe)
      setUsers(mappedUsers)
      setStages(mappedStages)
      setMatches(mappedMatches)
      setUpdatingScores(configRaw?.updatingScores ?? false)

      await loadBets(mappedMe.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [loadBets])

  const refreshBets = useCallback(async () => {
    if (!me) return
    try {
      await loadBets(me.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar apostas')
    }
  }, [loadBets, me, users])

  useEffect(() => {
    if (enabled) refresh()
    else {
      setMe(null)
      setUsers([])
      setStages([])
      setMatches([])
      setMyBets({})
      setMyApiBets([])
      setMyOpenBets({})
      setLoading(false)
    }
  }, [enabled, refresh])

  const value = useMemo(
    () => ({
      me,
      users,
      stages,
      matches,
      myBets,
      myApiBets,
      myOpenBets,
      loading,
      error,
      updatingScores,
      refresh,
      refreshBets,
    }),
    [me, users, stages, matches, myBets, myApiBets, myOpenBets, loading, error, updatingScores, refresh, refreshBets],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
