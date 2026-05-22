import { MatchStage, MatchStatus, StageStatus, type PointsEarned } from './enums.js'

export interface TeamPayload {
	name: string
	shortName: string
	tla: string
	crest: string
}

export interface AuthenticatedUser {
	_id: string
	googleSub: string
	name: string
	email: string
	picture: string
	exactScore: number
	winnerWithGoal: number
	correctWinner: number
	oneGoalCorrect: number
	wrong: number
	totalPointsEarned: number
	ranking: number
	previousRanking: number
	isAdmin: boolean
	isActive: boolean
}

export interface ConfigPayload {
	updatingScores: boolean
	pointsExactScore: number
	pointsWinnerWithGoal: number
	pointsOneGoalCorrect: number
	pointsCorrectWinner: number
}

export interface StageVisibleItem {
	matchStage: MatchStage
	status: StageStatus
	deadline?: string
}

export interface MatchListItem {
	_id: string
	footballDataId: number
	utcDate: string
	status: MatchStatus
	matchday: number
	stage: MatchStage
	group: string
	homeTeam: TeamPayload
	awayTeam: TeamPayload
	homeTeamScore?: number
	awayTeamScore?: number
}

export interface BetListItem {
	_id: string
	matchId: string
	utcDate: string
	stage: MatchStage
	group: string
	status: MatchStatus
	homeTeam: TeamPayload
	awayTeam: TeamPayload
	/** Placar real da partida (definitivo quando FINISHED, parcial quando LIVE). */
	matchHomeTeamScore?: number
	matchAwayTeamScore?: number
	/** Aposta do usuário para essa partida. */
	homeTeamScore?: number
	awayTeamScore?: number
}

export interface BetUpdateItem {
	_id: string
	homeTeamScore: number | null
	awayTeamScore: number | null
}

export interface GroupedBetItem {
	user: { _id: string; name: string; picture: string }
	homeTeamScore?: number
	awayTeamScore?: number
	exactScore: boolean
	winnerWithGoal: boolean
	correctWinner: boolean
	oneGoalCorrect: boolean
	wrong: boolean
	totalPointsEarned: PointsEarned
}

export interface GroupedBet {
	matchId: string
	utcDate: string
	stage: MatchStage
	group: string
	homeTeam: TeamPayload
	homeTeamScore?: number
	awayTeam: TeamPayload
	awayTeamScore?: number
	exactScore: number
	winnerWithGoal: number
	correctWinner: number
	oneGoalCorrect: number
	wrong: number
	total: number
	bets: GroupedBetItem[]
}

export interface RankingItem {
	_id: string
	name: string
	picture: string
	ranking: number
	previousRanking: number
	totalPointsEarned: number
	exactScore: number
	winnerWithGoal: number
	correctWinner: number
	oneGoalCorrect: number
	wrong: number
}

export interface StatsOverview {
	totalMatches: number
	totalExactBets: number
	totalCorrectBets: number
	leader: { _id: string; name: string; picture: string; totalPointsEarned: number } | null
}

export interface UserAccuracy {
	_id: string
	name: string
	picture: string
	exactScore: number
	winnerWithGoal: number
	correctWinner: number
	oneGoalCorrect: number
	wrong: number
	totalBets: number
	accuracyPct: number
}

export interface Distribution {
	exact: { count: number; pct: number }
	winnerWithGoal: { count: number; pct: number }
	correctWinner: { count: number; pct: number }
	oneGoalCorrect: { count: number; pct: number }
	wrong: { count: number; pct: number }
	totalEvaluatedBets: number
}
