import { PhaseStatus } from '@bolao/shared'

import type { TeamType } from '../features/time/timeSlice'
import type { MatchType } from '../features/partida/partidaSlice'
import type { PalpiteType } from '../features/palpite/palpiteSlice'

export const phaseIsOpen = (status?: PhaseStatus) => status === PhaseStatus.OPEN

export const phaseIsBlocked = (status?: PhaseStatus) => status === PhaseStatus.BLOCKED

export const phaseIsVisibleInNav = (status?: PhaseStatus) =>
	phaseIsOpen(status) || phaseIsBlocked(status)

export const matchHasResult = (match: MatchType) =>
	match.homeTeamScore !== undefined &&
	match.homeTeamScore >= 0 &&
	match.awayTeamScore !== undefined &&
	match.awayTeamScore >= 0

export const sortMatchesByDate = (matches: MatchType[]) =>
	[...matches].sort(
		(a, b) => new Date(a.utcDate!).getTime() - new Date(b.utcDate!).getTime(),
	)

export const teamLabel = (team?: TeamType) => team?.shortName ?? team?.name ?? team?.tla ?? ''

export const matchLabel = (match?: MatchType) =>
	match ? `${teamLabel(match.homeTeam)} x ${teamLabel(match.awayTeam)}` : ''

export const lastFinishedMatchId = (matches: MatchType[]) => {
	const finished = sortMatchesByDate(matches.filter(matchHasResult))
	return finished.length > 0 ? finished[finished.length - 1].id : 0
}

export const sortBetsByMatchDate = (bets: PalpiteType[]) =>
	[...bets].sort((a, b) => {
		const dateA = a.match?.utcDate ? new Date(a.match.utcDate).getTime() : 0
		const dateB = b.match?.utcDate ? new Date(b.match.utcDate).getTime() : 0
		return dateA - dateB
	})

export const betsUpToMatch = (bets: PalpiteType[], maxMatchId: number) =>
	sortBetsByMatchDate(bets.filter((b) => b.match?.id !== undefined && b.match.id <= maxMatchId))
