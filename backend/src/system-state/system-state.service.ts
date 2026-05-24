import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import type { SystemStatePayload } from '@bolao/shared'

import { SystemState } from './schemas/system-state.schema'

const KEY = 'singleton'

@Injectable()
export class SystemStateService {

	constructor(@InjectModel(SystemState.name) private readonly model: Model<SystemState>) {}

	private async load(): Promise<SystemState> {
		const doc = await this.model.findOne({ key: KEY }).exec()
		if (doc) return doc
		return this.model.create({ key: KEY })
	}

	async getPayload(): Promise<SystemStatePayload> {
		const s = await this.load()
		const scoringInProgress =
			!!s.scoreSyncStartedAt &&
			(!s.scoreSyncCompletedAt || s.scoreSyncStartedAt > s.scoreSyncCompletedAt)
		return {
			scoreSyncStartedAt: s.scoreSyncStartedAt?.toISOString() ?? null,
			scoreSyncCompletedAt: s.scoreSyncCompletedAt?.toISOString() ?? null,
			leaderboardRebuildAt: s.leaderboardRebuildAt?.toISOString() ?? null,
			lastMatchImportAt: s.lastMatchImportAt?.toISOString() ?? null,
			scoringInProgress,
		}
	}

	scoreSyncStarted() {
		return this.model.updateOne({ key: KEY }, { $set: { scoreSyncStartedAt: new Date() } }, { upsert: true }).exec()
	}

	scoreSyncCompleted() {
		return this.model.updateOne({ key: KEY }, { $set: { scoreSyncCompletedAt: new Date() } }, { upsert: true }).exec()
	}

	leaderboardRebuilt() {
		return this.model.updateOne({ key: KEY }, { $set: { leaderboardRebuildAt: new Date() } }, { upsert: true }).exec()
	}

	matchImported() {
		return this.model.updateOne({ key: KEY }, { $set: { lastMatchImportAt: new Date() } }, { upsert: true }).exec()
	}
}
