import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useConfig } from './useConfig'

const INVALIDATE_KEYS = [['bets'], ['ranking'], ['stats']] as const

export function useWatchResults() {

	const { data } = useConfig()
	const qc = useQueryClient()
	const previousRef = useRef<string | null | undefined>(undefined)

	useEffect(() => {
		const current = data?.lastUpdateResults ?? null

		if (previousRef.current === undefined) {
			previousRef.current = current
			return
		}

		if (previousRef.current === current) return

		previousRef.current = current
		INVALIDATE_KEYS.forEach((key) => qc.invalidateQueries({ queryKey: key }))
	}, [data?.lastUpdateResults, qc])
}
