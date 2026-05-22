import type { ApiBet, ApiMatch, ApiStage, ApiUser } from '@/api/types'
import { MatchStage, MatchStatus, StageStatus } from '@/lib/enums'
import { STAGE_LABELS, STAGE_ORDER } from '@/lib/stages'
import type { Bet, BetMap, Match, Stage, StageStatus as UiStageStatus, User } from '@/types'

export function mapStageStatus(status: StageStatus): UiStageStatus {
  if (status === StageStatus.OPEN) return 'OPEN'
  if (status === StageStatus.BLOCKED) return 'BLOCKED'
  return 'DISABLED'
}

export function mapStage(api: ApiStage): Stage {
  const labels = STAGE_LABELS[api.matchStage as MatchStage] ?? { name: api.matchStage, short: api.matchStage }
  return {
    matchStage: api.matchStage,
    name: labels.name,
    short: labels.short,
    status: mapStageStatus(api.status),
    order: STAGE_ORDER.indexOf(api.matchStage as MatchStage),
    deadline: api.deadline ?? null,
  }
}

export function sortStages(stages: Stage[]): Stage[] {
  return [...stages].sort((a, b) => a.order - b.order)
}

function mapMatchStatus(status: MatchStatus): Match['status'] {
  if ([MatchStatus.LIVE, MatchStatus.IN_PLAY, MatchStatus.PAUSED].includes(status)) return 'live'
  if (status === MatchStatus.FINISHED) return 'finished'
  return 'upcoming'
}

function formatDateParts(utcDate: string) {
  const d = new Date(utcDate)
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

export function mapMatch(api: ApiMatch): Match {
  const { date, time } = formatDateParts(api.utcDate)
  return {
    id: api._id,
    matchStage: api.stage,
    home: api.homeTeam?.shortName ?? api.homeTeam?.name ?? '—',
    hf: api.homeTeam?.tla ?? '—',
    away: api.awayTeam?.shortName ?? api.awayTeam?.name ?? '—',
    af: api.awayTeam?.tla ?? '—',
    date,
    time,
    status: mapMatchStatus(api.status),
    hs: api.homeTeamScore ?? null,
    as: api.awayTeamScore ?? null,
    crestHome: api.homeTeam?.crest,
    crestAway: api.awayTeam?.crest,
  }
}

export function mapUser(api: ApiUser): User {
  return {
    id: api._id,
    name: api.name,
    avatar: api.picture ? '' : api.name.charAt(0).toUpperCase(),
    picture: api.picture,
    flag: '',
    pts: api.cumulativeTotal,
    exactScore: api.exactScore,
    winnerWithGoal: api.winnerWithGoal,
    correctWinner: api.correctWinner,
    oneGoalCorrect: api.oneGoalCorrect,
    ranking: api.ranking,
  }
}

function matchIdFromBet(match: ApiBet['match']): string {
  return typeof match === 'string' ? match : match._id
}

/** Apostas do usuário logado (GET /api/bet retorna só o próprio usuário). */
export function buildMyBetsMap(bets: ApiBet[], myId: string): BetMap {
  const map: BetMap = {}
  for (const bet of bets) {
    const userId = typeof bet.user === 'string' ? bet.user : bet.user._id
    if (userId !== myId) continue
    if (bet.homeTeamScore == null || bet.awayTeamScore == null) continue
    map[matchIdFromBet(bet.match)] = { h: bet.homeTeamScore, a: bet.awayTeamScore }
  }
  return map
}

export function buildMyOpenBets(bets: ApiBet[], myId: string): Record<string, { betId: string; bet: Bet }> {
  const map: Record<string, { betId: string; bet: Bet }> = {}
  for (const b of bets) {
    if (typeof b.user === 'string' && b.user !== myId) continue
    if (!b._id) continue
    map[matchIdFromBet(b.match)] = {
      betId: b._id,
      bet: {
        h: b.homeTeamScore ?? '',
        a: b.awayTeamScore ?? '',
      },
    }
  }
  return map
}

