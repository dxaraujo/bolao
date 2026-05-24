import { useQuery } from '@tanstack/react-query'
import type { UserPayload } from '@bolao/shared'

import { api } from '@/lib/api'

export function useMe() {
	return useQuery({
		queryKey: ['user', 'me'],
		queryFn: ({ signal }) => api.get<UserPayload>('/api/user/me', signal),
		staleTime: 60_000,
	})
}
