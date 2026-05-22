import { useQuery } from '@tanstack/react-query'
import type { StageVisibleItem } from '@bolao/shared'

import { api } from '@/lib/api'
import { sortStages } from '@/lib/stage'

export function useStages() {
	return useQuery({
		queryKey: ['stages', 'visible'],
		queryFn: async ({ signal }) => sortStages(await api.get<StageVisibleItem[]>('/api/stage/visible', signal)),
		staleTime: 60_000,
	})
}
