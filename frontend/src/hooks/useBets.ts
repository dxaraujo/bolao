import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { BetListItem, BetUpdateItem, GroupedBet } from '@bolao/shared'

import { api } from '@/lib/api'

export function useMyBets() {
	return useQuery({
		queryKey: ['bets', 'mine'],
		queryFn: ({ signal }) => api.get<BetListItem[]>('/api/bet', signal),
		staleTime: 15_000,
	})
}

export function useAllBets() {
	return useQuery({
		queryKey: ['bets', 'all'],
		queryFn: ({ signal }) => api.get<GroupedBet[]>('/api/bet/all', signal),
		staleTime: 30_000,
	})
}

export function useUpdateBets() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: (bets: BetUpdateItem[]) => api.put<void>('/api/bet/updateBets', { bets }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['bets', 'mine'] })
		},
	})
}
