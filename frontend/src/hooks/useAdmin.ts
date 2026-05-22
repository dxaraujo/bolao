import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { StageStatus, StageVisibleItem } from '@bolao/shared'

import { api } from '@/lib/api'
import { sortStages } from '@/lib/stage'

export function useAdminStages() {
	return useQuery({
		queryKey: ['admin', 'stages'],
		queryFn: async ({ signal }) => sortStages(await api.get<StageVisibleItem[]>('/api/stage', signal)),
	})
}

export function useImportTeams() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: () => api.post<string>('/api/team/import'),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['matches'] })
		},
	})
}

export function useImportMatches() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: () => api.post<string>('/api/match/import'),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['matches'] })
			qc.invalidateQueries({ queryKey: ['stages'] })
			qc.invalidateQueries({ queryKey: ['admin', 'stages'] })
		},
	})
}

export function useUpdateScores() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: () => api.post<string>('/api/match/update-scores'),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['matches'] })
			qc.invalidateQueries({ queryKey: ['ranking'] })
			qc.invalidateQueries({ queryKey: ['stats'] })
			qc.invalidateQueries({ queryKey: ['bets'] })
		},
	})
}

interface AdvanceStagePayload {
	matchStage: string
	status: StageStatus
	deadline?: string
}

export function useAdvanceStage() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ matchStage, status, deadline }: AdvanceStagePayload) =>
			api.put<StageVisibleItem>(`/api/stage/${matchStage}`, { status, deadline }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['admin', 'stages'] })
			qc.invalidateQueries({ queryKey: ['stages'] })
			qc.invalidateQueries({ queryKey: ['bets'] })
		},
	})
}
