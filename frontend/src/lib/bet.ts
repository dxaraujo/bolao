import type { ApiBet, ApiBetUser } from '@/api/types'
import type { Bet, Match, BetResult } from '@/types'
import { SCORING } from '@/lib/enums'

export type BetSummaryBucket = 'exact' | 'correct' | 'wrong'

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
  if ((bet.totalPointsEarned ?? 0) === 0) {
    return { label: '✗ Errou', color: '#ef4444', tw: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/30', bucket: 'wrong' }
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
  return dir(bet.h as number, bet.a as number) === dir(match.hs, match.as!) ? 'correct' : 'wrong'
}

export function resultPts(r: BetResult) {
  return r === 'exact' ? SCORING.exactScore : r === 'correct' ? SCORING.correctWinner : SCORING.wrong
}

export const RESULT_META: Record<BetResult, { label: string; color: string; tw: string }> = {
  exact: { label: '🎯 Exato', color: '#22c55e', tw: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/30' },
  correct: { label: '✓ Certo', color: '#f59e0b', tw: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30' },
  wrong: { label: '✗ Errou', color: '#ef4444', tw: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/30' },
  pending: { label: '—', color: '#64849f', tw: 'text-[#64849f] bg-transparent border-transparent' },
}
