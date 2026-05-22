import { useQuery } from '@tanstack/react-query'
import type { Distribution, StageAccuracy, StatsOverview, UserAccuracy } from '@bolao/shared'

import { api } from '@/lib/api'

export function useStatsOverview() {
	return useQuery({
		queryKey: ['stats', 'overview'],
		queryFn: ({ signal }) => api.get<StatsOverview>('/api/stats/overview', signal),
	})
}

export function useStatsAccuracyByUser() {
	return useQuery({
		queryKey: ['stats', 'accuracy-by-user'],
		queryFn: ({ signal }) => api.get<UserAccuracy[]>('/api/stats/accuracy-by-user', signal),
	})
}

export function useStatsAccuracyByStage() {
	return useQuery({
		queryKey: ['stats', 'accuracy-by-stage'],
		queryFn: ({ signal }) => api.get<StageAccuracy[]>('/api/stats/accuracy-by-stage', signal),
	})
}

export function useStatsDistribution() {
	return useQuery({
		queryKey: ['stats', 'distribution'],
		queryFn: ({ signal }) => api.get<Distribution>('/api/stats/distribution', signal),
	})
}
