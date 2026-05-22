import type { MatchStage, MatchStatus, StageStatus } from '@/lib/enums'

export interface ApiUser {
  _id: string
  name: string
  email: string
  picture?: string
  exactScore: number
  winnerWithGoal: number
  correctWinner: number
  oneGoalCorrect: number
  cumulativeTotal: number
  ranking?: number
  previousRanking: number
  isAdmin: boolean
  isActive: boolean
}

export interface ApiTeam {
  _id?: string
  name: string
  shortName: string
  tla: string
  crest?: string
}

export interface ApiMatch {
  _id: string
  footballDataId: number
  utcDate: string
  status: MatchStatus
  matchday: number
  stage: MatchStage
  group: string
  homeTeam?: ApiTeam
  awayTeam?: ApiTeam
  homeTeamScore?: number
  awayTeamScore?: number
}

export interface ApiStage {
  _id: string
  matchStage: MatchStage
  status: StageStatus
  deadline?: string | null
}

export interface ApiBetUser {
  _id: string
  name: string
  picture?: string
}

export interface ApiBet {
  _id?: string
  user: string | ApiBetUser
  match: string | ApiMatch
  homeTeamScore?: number
  awayTeamScore?: number
  totalPointsEarned?: 0 | 1 | 2 | 3 | 5
  exactScore?: boolean
  winnerWithGoal?: boolean
  correctWinner?: boolean
  oneGoalCorrect?: boolean
  ranking?: number
  previousRanking?: number
  cumulativeTotal?: number
}

export interface ApiConfig {
  updatingScores: boolean
}

export interface ApiSuccess<T> {
  data: T
}

export interface ApiErrorBody {
  errors: string | string[]
  statusCode: number
}
