import type { MatchStage } from '@/lib/enums'

export type StageStatus = 'OPEN' | 'BLOCKED' | 'DISABLED'
export type MatchStatus = 'upcoming' | 'live' | 'finished'
export type BetResult = 'exact' | 'correct' | 'wrong' | 'pending'

export interface Stage {
  matchStage: MatchStage | string
  name: string
  short: string
  status: StageStatus
  order: number
  deadline: string | null
}

export interface Match {
  id: string
  matchStage: MatchStage | string
  home: string
  hf: string
  away: string
  af: string
  date: string
  time: string
  status: MatchStatus
  hs: number | null
  as: number | null
  crestHome?: string
  crestAway?: string
}

export interface User {
  id: string
  name: string
  avatar: string
  picture?: string
  flag: string
  pts: number
  exact: number
  correct: number
  wrong: number
  ranking?: number
}

export interface Bet {
  h: number | ''
  a: number | ''
}

export type BetMap = Record<string, Bet>
export type UserBetMap = Record<string, Bet>
export type AllBetsMap = Record<string, UserBetMap>

export type Screen = 'home' | 'rank' | 'bets' | 'bolao' | 'stats'
