import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AuthenticatedUser, StageStatus, StageVisibleItem } from '@bolao/shared'

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
}

export function useAdvanceStage() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ matchStage, status }: AdvanceStagePayload) =>
			api.put<StageVisibleItem>(`/api/stage/${matchStage}`, { status }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['admin', 'stages'] })
			qc.invalidateQueries({ queryKey: ['stages'] })
			qc.invalidateQueries({ queryKey: ['bets'] })
		},
	})
}

export function useAdminUsers() {
	return useQuery({
		queryKey: ['admin', 'users'],
		queryFn: ({ signal }) => api.get<AuthenticatedUser[]>('/api/user', signal),
	})
}

interface UpdateUserPayload {
	id: string
	isActive?: boolean
	isAdmin?: boolean
}

export function useUpdateUser() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: ({ id, ...body }: UpdateUserPayload) =>
			api.put<AuthenticatedUser>(`/api/user/${id}`, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['admin', 'users'] })
			qc.invalidateQueries({ queryKey: ['bets'] })
			qc.invalidateQueries({ queryKey: ['ranking'] })
		},
	})
}
