import type { ApiBet, ApiBetUser } from '@/api/types'
import type { Bet, BetResult, Match, User } from '@/types'
import { SCORING } from '@/lib/enums'

export const USER_SCORE_FIELDS = [
  'exactScore',
  'winnerWithGoal',
  'correctWinner',
  'oneGoalCorrect',
] as const satisfies readonly (keyof User)[]

export function userHits(u: Pick<User, (typeof USER_SCORE_FIELDS)[number]>): number {
  return u.exactScore + u.winnerWithGoal + u.correctWinner + u.oneGoalCorrect
}

export function aggregateUserOutcomes(users: User[]): {
  counts: Record<BetOutcomeType, number>
  total: number
} {
  const counts = emptyOutcomeCounts()
  for (const u of users) {
    counts.exactScore += u.exactScore
    counts.winnerWithGoal += u.winnerWithGoal
    counts.correctWinner += u.correctWinner
    counts.oneGoalCorrect += u.oneGoalCorrect
  }
  const total = BET_OUTCOME_ORDER.reduce((sum, key) => sum + counts[key], 0)
  return { counts, total }
}

export function formatUserStatsCompact(u: User): string {
  return [
    `${u.exactScore}🎯`,
    `${u.winnerWithGoal}VG`,
    `${u.correctWinner}V`,
    `${u.oneGoalCorrect}G`,
  ].join(' · ')
}

export type BetOutcomeType = keyof typeof SCORING

export type BetSummaryBucket = 'exact' | 'correct'

export const BET_OUTCOME_ORDER: BetOutcomeType[] = [
  'exactScore',
  'winnerWithGoal',
  'correctWinner',
  'oneGoalCorrect',
]

export const BET_OUTCOME_META: Record<
  BetOutcomeType,
  { label: string; short: string; icon: string; color: string }
> = {
  exactScore: { label: 'Placar Exato', short: 'Exato', icon: '🎯', color: '#22c55e' },
  winnerWithGoal: { label: 'Venc. + Gol', short: 'V+Gol', icon: '✓', color: '#f59e0b' },
  correctWinner: { label: 'Vencedor', short: 'Venc.', icon: '✅', color: '#eab308' },
  oneGoalCorrect: { label: 'Gol', short: 'Gol', icon: '·', color: '#a78bfa' },
}

export function emptyOutcomeCounts(): Record<BetOutcomeType, number> {
  return { exactScore: 0, winnerWithGoal: 0, correctWinner: 0, oneGoalCorrect: 0 }
}

export function betOutcomeFromApi(bet: ApiBet): BetOutcomeType | null {
  if (bet.homeTeamScore == null || bet.awayTeamScore == null) return null
  if (bet.exactScore) return 'exactScore'
  if (bet.winnerWithGoal) return 'winnerWithGoal'
  if (bet.correctWinner) return 'correctWinner'
  if (bet.oneGoalCorrect) return 'oneGoalCorrect'
  return null
}

export function aggregateOutcomes(
  bets: ApiBet[],
  matchIds?: Set<string>,
): { counts: Record<BetOutcomeType, number>; total: number } {
  const counts = emptyOutcomeCounts()
  let total = 0
  for (const bet of bets) {
    const matchId = typeof bet.match === 'string' ? bet.match : bet.match._id
    if (matchIds && !matchIds.has(matchId)) continue
    const outcome = betOutcomeFromApi(bet)
    if (!outcome) continue
    counts[outcome]++
    total++
  }
  return { counts, total }
}

export function isPopulatedUser(user: ApiBet['user']): user is ApiBetUser {
  return typeof user === 'object' && user !== null && '_id' in user
}

export function resolveBetDisplay(bet: ApiBet): {
  label: string
  color: string
  tw: string
  bucket: BetSummaryBucket | null
} {
  if (bet.homeTeamScore == null || bet.awayTeamScore == null) {
    return { label: '—', color: '#64849f', tw: 'text-[#64849f] bg-transparent border-transparent', bucket: null }
  }
  if (bet.exactScore) {
    return { label: '🎯 Exato', color: '#22c55e', tw: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/30', bucket: 'exact' }
  }
  if (bet.winnerWithGoal) {
    return { label: '✓ Vencedor+Gol', color: '#f59e0b', tw: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30', bucket: 'correct' }
  }
  if (bet.correctWinner) {
    return { label: '✓ Resultado', color: '#f59e0b', tw: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30', bucket: 'correct' }
  }
  if (bet.oneGoalCorrect) {
    return { label: '· 1 gol', color: '#a78bfa', tw: 'text-[#a78bfa] bg-[#a78bfa]/10 border-[#a78bfa]/30', bucket: 'correct' }
  }
  return { label: '—', color: '#64849f', tw: 'text-[#64849f] bg-transparent border-transparent', bucket: null }
}

export function summaryBucketFromBet(bet: ApiBet): BetSummaryBucket | null {
  return resolveBetDisplay(bet).bucket
}

export function betResult(bet: Bet | undefined, match: Match): BetResult {
  if (!bet || bet.h === '' || bet.a === '' || match.hs === null) return 'pending'
  if (bet.h === match.hs && bet.a === match.as) return 'exact'
  const dir = (h: number, a: number) => (h > a ? 'H' : h < a ? 'A' : 'D')
  return dir(bet.h as number, bet.a as number) === dir(match.hs, match.as!) ? 'correct' : 'pending'
}

export function resultPts(r: BetResult) {
  return r === 'exact' ? SCORING.exactScore : r === 'correct' ? SCORING.correctWinner : 0
}

export const RESULT_META: Record<BetResult, { label: string; color: string; tw: string }> = {
  exact: { label: '🎯 Exato', color: '#22c55e', tw: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/30' },
  correct: { label: '✓ Certo', color: '#f59e0b', tw: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30' },
  pending: { label: '—', color: '#64849f', tw: 'text-[#64849f] bg-transparent border-transparent' },
}
