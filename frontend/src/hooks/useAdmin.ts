import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { MatchStage, StagePayload, StageReadinessItem, UserPayload } from '@bolao/shared'

import { api } from '@/lib/api'

export function useAdminUsers() {
	return useQuery({
		queryKey: ['admin', 'users'],
		queryFn: ({ signal }) => api.get<UserPayload[]>('/api/user', signal),
	})
}

export function useUpdateUser() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, ...body }: { id: string; isActive?: boolean; isAdmin?: boolean }) =>
			api.patch<UserPayload>(`/api/user/${id}`, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['admin', 'users'] })
			qc.invalidateQueries({ queryKey: ['leaderboard'] })
		},
	})
}

export function useStageReadiness() {
	return useQuery({
		queryKey: ['admin', 'stage-readiness'],
		queryFn: ({ signal }) => api.get<StageReadinessItem[]>('/api/stage/readiness', signal),
		staleTime: 30_000,
	})
}

export function useUpdateStage() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ code, ...body }: { code: MatchStage; deadline?: string; expectedMatchCount?: number }) =>
			api.patch<StagePayload>(`/api/stage/${code}`, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['stages'] })
			qc.invalidateQueries({ queryKey: ['admin', 'stage-readiness'] })
		},
	})
}

export function useImportTeams() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: () => api.post<string>('/api/team/import'),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
	})
}

export function useImportMatches() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: () => api.post<{ imported: number; skipped: number }>('/api/match/import'),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['matches'] })
			qc.invalidateQueries({ queryKey: ['stages'] })
			qc.invalidateQueries({ queryKey: ['bets'] })
		},
	})
}

export function useSyncScores() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: () => api.post<{ changed: number }>('/api/match/sync-scores'),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['matches'] })
			qc.invalidateQueries({ queryKey: ['leaderboard'] })
			qc.invalidateQueries({ queryKey: ['bets'] })
		},
	})
}

export function useRebuildLeaderboard() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: () => api.post<unknown>('/api/leaderboard/rebuild'),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['leaderboard'] }),
	})
}

export function useAdvanceNextMatch() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: () =>
			api.post<{ _id: string; footballDataId: number; score: { home: number; away: number }; status: string }>(
				'/api/match/advance-next',
			),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['matches'] })
			qc.invalidateQueries({ queryKey: ['leaderboard'] })
			qc.invalidateQueries({ queryKey: ['bets'] })
		},
	})
}
