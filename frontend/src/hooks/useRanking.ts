import { useQuery } from '@tanstack/react-query'
import type { RankingItem } from '@bolao/shared'

import { api } from '@/lib/api'

export function useRanking() {
	return useQuery({
		queryKey: ['ranking'],
		queryFn: ({ signal }) => api.get<RankingItem[]>('/api/ranking', signal),
		staleTime: 30_000,
	})
}
