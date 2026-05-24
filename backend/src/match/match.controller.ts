import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { getStageState, MatchStage, type MatchPayload, type TeamPayload } from '@bolao/shared'

import { AdminGuard } from '../common/admin.guard'
import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { StageService } from '../stage/stage.service'
import { Team } from '../team/schemas/team.schema'
import { MatchService } from './match.service'
import { ScoreService } from './score.service'
import type { StageDocument } from '../stage/schemas/stage.schema'

@ApiTags('match')
@Controller('api/match')
@ApiProtectedInDocs()
export class MatchController {
	constructor(
		private readonly service: MatchService,
		private readonly scoreService: ScoreService,
		private readonly stageService: StageService,
	) {}

	@Get()
	async list() {
		const matches = await this.service.listAll()
		const stages = await this.stageService.findAll()
		const all = stages.map((s) => ({ code: s.code, deadline: s.deadline }))
		const now = new Date()
		const data: MatchPayload[] = matches.map((m) => {
			const stage = m.stage as unknown as StageDocument
			const home = m.homeTeam as unknown as Team & { _id: { toString(): string } }
			const away = m.awayTeam as unknown as Team & { _id: { toString(): string } }
			return {
				_id: m._id.toString(),
				footballDataId: m.footballDataId,
				utcDate: m.utcDate.toISOString(),
				status: m.status,
				stage: stage.code,
				stageState: getStageState({ code: stage.code, deadline: stage.deadline }, all, now),
				group: m.group,
				homeTeam: teamPayload(home),
				awayTeam: teamPayload(away),
				score: m.score ? { home: m.score.home, away: m.score.away } : undefined,
			}
		})
		return { data }
	}

	@Post('import')
	@UseGuards(AdminGuard)
	async import() {
		const result = await this.service.importMatches()
		return { data: result }
	}

	@Post('sync-scores')
	@UseGuards(AdminGuard)
	async syncScores() {
		const result = await this.scoreService.syncScores()
		return { data: { changed: result.changedIds.length } }
	}
}

function teamPayload(t: Team & { _id: { toString(): string } }): TeamPayload {
	return {
		_id: t._id.toString(),
		name: t.name,
		shortName: t.shortName,
		tla: t.tla,
		flagEmoji: t.flagEmoji,
		crest: t.crest,
	}
}
