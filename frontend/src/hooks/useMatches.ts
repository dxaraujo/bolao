import { useQuery } from '@tanstack/react-query'
import type { MatchListItem } from '@bolao/shared'

import { api } from '@/lib/api'

export function useMatches() {
	return useQuery({
		queryKey: ['matches', 'visible'],
		queryFn: ({ signal }) => api.get<MatchListItem[]>('/api/match', signal),
		staleTime: 30_000,
	})
}
