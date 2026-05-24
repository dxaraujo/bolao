import { useQuery } from '@tanstack/react-query'
import type { UserPayload } from '@bolao/shared'

import { useAuth } from '@/providers/AuthProvider'
import { api } from '@/lib/api'

export function useMe() {
	const { authenticated } = useAuth()

	return useQuery({
		queryKey: ['user', 'me'],
		queryFn: ({ signal }) => api.get<UserPayload>('/api/user/me', signal),
		enabled: authenticated,
		staleTime: 60_000,
	})
}
