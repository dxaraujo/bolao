import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { getStageState, type MatchPayload, type TeamPayload } from '@bolao/shared'

import { AdminGuard } from '../common/admin.guard'
import { ApiProtectedInDocs } from '../common/swagger-auth.decorator'
import { LeaderboardService } from '../leaderboard/leaderboard.service'
import { StageService } from '../stage/stage.service'
import { SystemStateService } from '../system-state/system-state.service'
import { Team } from '../team/schemas/team.schema'
import { MatchService } from './match.service'
import type { StageDocument } from '../stage/schemas/stage.schema'
import { Public } from 'src/common/public.decorator'

@ApiTags('match')
@Controller('api/match')
@ApiProtectedInDocs()
export class MatchController {
	constructor(
		private readonly service: MatchService,
		private readonly stageService: StageService,
		private readonly leaderboardService: LeaderboardService,
		private readonly systemState: SystemStateService,
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
		if (result.changedIds.length > 0) {
			await this.leaderboardService.rebuild()
			await this.systemState.leaderboardRebuilt()
		}
		await this.systemState.matchImported()
		return { data: result }
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
