import { useQuery } from '@tanstack/react-query'
import type { SystemStatePayload } from '@bolao/shared'

import { api } from '@/lib/api'

export function useSystemState() {
	return useQuery({
		queryKey: ['system', 'state'],
		queryFn: ({ signal }) => api.get<SystemStatePayload>('/api/system/state', signal),
		staleTime: 30_000,
		refetchInterval: 30_000,
	})
}
