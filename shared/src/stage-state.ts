/**
 * Função pura que deriva o estado de uma fase a partir do tempo atual e dos deadlines.
 */

import { MatchStage, StageState, STAGE_ORDER, STAGE_PREDECESSOR } from './enums.js'

export interface StageInput {
	code: MatchStage
	deadline: Date | string
}

const toDate = (d: Date | string): Date => (d instanceof Date ? d : new Date(d))

/**
 * Identifica a fase predecessora (que precisa estar CLOSED para esta abrir).
 */
export const findPredecessor = (code: MatchStage, all: StageInput[]): StageInput | null => {
	return all.find((s) => s.code === STAGE_PREDECESSOR[code]) ?? null
}

/**
 * Deriva o estado de uma fase. Função pura.
 *
 * Regra:
 *  - LOCKED: existe predecessora E now < predecessora.deadline
 *  - CLOSED: now >= deadline
 *  - OPEN: caso contrário
 */
export const getStageState = (stage: StageInput, all: StageInput[], now: Date = new Date()): StageState => {
	const deadline = toDate(stage.deadline)
	if (now.getTime() >= deadline.getTime()) return StageState.CLOSED

	const prev = findPredecessor(stage.code, all)
	if (prev) {
		const prevDeadline = toDate(prev.deadline)
		if (now.getTime() < prevDeadline.getTime()) return StageState.LOCKED
	}

	return StageState.OPEN
}
