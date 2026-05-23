import { useQuery } from '@tanstack/react-query'
import type { ConfigPayload } from '@bolao/shared'

import { api } from '@/lib/api'

export function useConfig() {
	return useQuery({
		queryKey: ['config'],
		queryFn: ({ signal }) => api.get<ConfigPayload>('/api/config', signal),
		staleTime: 30_000,
	})
}
