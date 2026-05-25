import { useQuery } from '@tanstack/react-query'
import type { Distribution, LeaderboardPayload, StatsOverview, UserAccuracy } from '@bolao/shared'

import { api } from '@/lib/api'

export function useLeaderboard() {
	return useQuery({
		queryKey: ['leaderboard'],
		queryFn: ({ signal }) => api.get<LeaderboardPayload>('/api/leaderboard', signal),
		staleTime: 30_000,
	})
}

export function useStatsOverview() {
	return useQuery({
		queryKey: ['leaderboard', 'stats', 'overview'],
		queryFn: ({ signal }) => api.get<StatsOverview>('/api/leaderboard/stats/overview', signal),
	})
}

export function useStatsAccuracy() {
	return useQuery({
		queryKey: ['leaderboard', 'stats', 'accuracy'],
		queryFn: ({ signal }) => api.get<UserAccuracy[]>('/api/leaderboard/stats/accuracy-by-user', signal),
	})
}

export function useStatsDistribution() {
	return useQuery({
		queryKey: ['leaderboard', 'stats', 'distribution'],
		queryFn: ({ signal }) => api.get<Distribution>('/api/leaderboard/stats/distribution', signal),
	})
}
