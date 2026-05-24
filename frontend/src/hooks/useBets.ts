import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { BetSubmitItem, BetSubmitPayload, GroupedBetMatch, MyBetItem } from '@bolao/shared'

import { api } from '@/lib/api'

export function useMyBets() {
	return useQuery({
		queryKey: ['bets', 'mine'],
		queryFn: ({ signal }) => api.get<MyBetItem[]>('/api/bet', signal),
		refetchInterval: 60_000,
		staleTime: 15_000,
	})
}

export function useAllBets() {
	return useQuery({
		queryKey: ['bets', 'all'],
		queryFn: ({ signal }) => api.get<GroupedBetMatch[]>('/api/bet/all', signal),
		staleTime: 30_000,
	})
}

export function useSubmitBets() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (items: BetSubmitItem[]) =>
			api.put<{ upserted: number; deleted: number }>('/api/bet', { items } satisfies BetSubmitPayload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['bets'] })
			qc.invalidateQueries({ queryKey: ['leaderboard'] })
		},
	})
}
