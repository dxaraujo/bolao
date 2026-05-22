/** Espelha @bolao/shared — evita dependência de workspace no Vite. */

export enum StageStatus {
  DISABLED = 0,
  OPEN = 1,
  BLOCKED = 2,
}

export enum MatchStage {
  FINAL = 'FINAL',
  SEMI_FINALS = 'SEMI_FINALS',
  THIRD_PLACE = 'THIRD_PLACE',
  QUARTER_FINALS = 'QUARTER_FINALS',
  LAST_16 = 'LAST_16',
  LAST_32 = 'LAST_32',
  GROUP_STAGE = 'GROUP_STAGE',
}

export enum MatchStatus {
  TIMED = 'TIMED',
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  IN_PLAY = 'IN_PLAY',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
  POSTPONED = 'POSTPONED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

export const SCORING = {
  exactScore: 5,
  winnerWithGoal: 3,
  correctWinner: 2,
  oneGoalCorrect: 1,
  wrong: 0,
} as const
