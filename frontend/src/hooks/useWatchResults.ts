import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { SystemStatePayload } from '@bolao/shared'

import { api } from '@/lib/api'
import { useAuth } from '@/providers/AuthProvider'

const INVALIDATE_KEYS = [['bets'], ['leaderboard']] as const
const TOAST_ID = 'results-update'

export function useWatchResults() {
	const { authenticated } = useAuth()
	const qc = useQueryClient()

	const { data } = useQuery({
		queryKey: ['system', 'state'],
		queryFn: ({ signal }) => api.get<SystemStatePayload>('/api/system/state', signal),
		enabled: authenticated,
		staleTime: 0,
		refetchInterval: authenticated ? 30_000 : false,
		refetchIntervalInBackground: true,
		refetchOnWindowFocus: true,
	})

	const previousRef = useRef<string | null | undefined>(undefined)

	useEffect(() => {
		const current = data?.leaderboardRebuildAt ?? null
		if (previousRef.current === undefined) {
			previousRef.current = current
			return
		}
		if (previousRef.current === current) return
		previousRef.current = current
		toast.success('Resultados atualizados', { id: TOAST_ID })
		INVALIDATE_KEYS.forEach((key) => qc.invalidateQueries({ queryKey: key, refetchType: 'all' }))
	}, [data?.leaderboardRebuildAt, qc])
}
