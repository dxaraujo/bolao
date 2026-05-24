import { useQuery } from '@tanstack/react-query'
import type { MatchPayload } from '@bolao/shared'

import { api } from '@/lib/api'

export function useMatches() {
	return useQuery({
		queryKey: ['matches'],
		queryFn: ({ signal }) => api.get<MatchPayload[]>('/api/match', signal),
		staleTime: 30_000,
	})
}
