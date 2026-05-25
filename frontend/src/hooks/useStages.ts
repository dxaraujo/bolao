import { useQuery } from '@tanstack/react-query'
import { StageState, type StagePayload } from '@bolao/shared'

import { api } from '@/lib/api'

export function useStages() {
	return useQuery({
		queryKey: ['stages'],
		queryFn: async ({ signal }) => {
			const all = await api.get<StagePayload[]>('/api/stage', signal)
			return all.filter((s) => s.state !== StageState.LOCKED).sort((a, b) => a.order - b.order)
		},
		staleTime: 60_000,
	})
}

export function useAllStages() {
	return useQuery({
		queryKey: ['stages', 'all'],
		queryFn: async ({ signal }) => {
			const all = await api.get<StagePayload[]>('/api/stage', signal)
			return all.sort((a, b) => a.order - b.order)
		},
		staleTime: 60_000,
	})
}
