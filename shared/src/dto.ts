import type { MatchStage, MatchStatus, StageState } from './enums.js'
import type { Score, LeaderboardBreakdown } from './scoring.js'

/* ------------------------------------------------------------------ */
/*  User / Auth                                                       */
/* ------------------------------------------------------------------ */

export interface AuthenticatedUser {
	_id: string
	googleSub: string
	name: string
	email: string
	avatar?: string
	isAdmin: boolean
	isActive: boolean
}

export interface UserPayload {
	_id: string
	name: string
	givenName?: string
	email: string
	avatar?: string
	isAdmin: boolean
	isActive: boolean
	participationChangedAt?: string
	createdAt: string
}

/* ------------------------------------------------------------------ */
/*  Team                                                              */
/* ------------------------------------------------------------------ */

export interface TeamPayload {
	_id: string
	name: string
	shortName: string
	tla: string
	flagEmoji?: string
	crest?: string
}

/* ------------------------------------------------------------------ */
/*  Stage                                                             */
/* ------------------------------------------------------------------ */

export interface StagePayload {
	_id: string
	code: MatchStage
	order: number
	state: StageState
	deadline: string
	expectedMatchCount: number
	importedMatchCount: number
	finishedMatchCount: number
}

export interface StageReadinessItem extends StagePayload {
	predecessor?: { code: MatchStage; state: StageState }
}

/* ------------------------------------------------------------------ */
/*  Match                                                             */
/* ------------------------------------------------------------------ */

export interface MatchPayload {
	_id: string
	footballDataId: number
	utcDate: string
	status: MatchStatus
	stage: MatchStage
	stageState: StageState
	group?: string
	homeTeam: TeamPayload
	awayTeam: TeamPayload
	score?: Score
}

/* ------------------------------------------------------------------ */
/*  Bet                                                               */
/* ------------------------------------------------------------------ */

export interface BetResult {
	exactScore: boolean
	winnerWithGoal: boolean
	correctWinner: boolean
	oneGoalCorrect: boolean
	wrong: boolean
	points: number
}

/** Visão do palpite do usuário autenticado, com a partida embedada. */
export interface MyBetItem {
	match: MatchPayload
	bet?: {
		_id: string
		score: Score
		updatedAt: string
	}
	result?: BetResult
}

/** Input para PUT /api/bet — score null em ambos significa "deletar". */
export interface BetSubmitItem {
	matchId: string
	score: Score | null
}

export interface BetSubmitPayload {
	items: BetSubmitItem[]
}

/** Agregado para /bolao — palpites de todos os participantes ativos por partida (fases CLOSED). */
export interface GroupedBetParticipant {
	user: { _id: string; name: string; avatar?: string }
	score?: Score
	result?: BetResult
}

export interface GroupedBetMatch {
	match: MatchPayload
	totals: {
		exactScore: number
		winnerWithGoal: number
		correctWinner: number
		oneGoalCorrect: number
		wrong: number
		notBet: number
		total: number
	}
	participants: GroupedBetParticipant[]
}

/* ------------------------------------------------------------------ */
/*  Leaderboard / Stats                                               */
/* ------------------------------------------------------------------ */

export interface LeaderboardItem {
	rank: number
	user: { _id: string; name: string; givenName?: string; avatar?: string }
	points: number
	breakdown: LeaderboardBreakdown
}

export interface LeaderboardPayload {
	generatedAt: string
	rows: LeaderboardItem[]
}

export interface StatsOverview {
	totalMatches: number
	finishedMatches: number
	totalExactBets: number
	totalCorrectBets: number
	leader: { _id: string; name: string; avatar?: string; points: number } | null
}

export interface UserAccuracy {
	_id: string
	name: string
	avatar?: string
	totalBets: number
	exactScore: number
	winnerWithGoal: number
	correctWinner: number
	oneGoalCorrect: number
	wrong: number
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

/* ------------------------------------------------------------------ */
/*  SystemState                                                       */
/* ------------------------------------------------------------------ */

export interface SystemStatePayload {
	scoreSyncStartedAt: string | null
	scoreSyncCompletedAt: string | null
	leaderboardRebuildAt: string | null
	lastMatchImportAt: string | null
	scoringInProgress: boolean
}
