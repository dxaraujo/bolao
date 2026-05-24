import { ChevronRight, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { StageState, type MyBetItem, type StagePayload } from '@bolao/shared'

import { STAGE_LABELS } from '@/lib/stage'
import { formatDeadline } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useMe } from '@/hooks/useMe'

interface OpenStageBannerProps {
	stages: StagePayload[]
	bets: MyBetItem[]
}

type BannerVariant = 'green' | 'warning' | 'red'

function getBannerVariant(deadline: string): BannerVariant {
	const hoursLeft = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60)
	if (hoursLeft <= 1) return 'red'
	if (hoursLeft <= 12) return 'warning'
	return 'green'
}

export function OpenStageBanner({ stages, bets }: OpenStageBannerProps) {
	const navigate = useNavigate()
	const { data: me } = useMe()
	const open = stages.find((s) => s.state === StageState.OPEN)
	if (!open) return null
	if (!me?.isActive) return null

	const stageBets = bets.filter((b) => b.match.stage === open.code)
	const total = stageBets.length
	const palpited = stageBets.filter((b) => !!b.bet).length
	const stageLabel = STAGE_LABELS[open.code]?.full ?? open.code
	const variant = getBannerVariant(open.deadline)

	return (
		<button
			type="button"
			onClick={() => navigate('/apostas')}
			className={cn(
				'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
				variant === 'green' && 'border-green/30 bg-green/10 hover:bg-green/15',
				variant === 'warning' && 'border-gold/30 bg-gold/10 hover:bg-gold/15',
				variant === 'red' && 'border-red/30 bg-red/10 hover:bg-red/15',
			)}
		>
			<div>
				<div
					className={cn(
						'flex items-center gap-2 text-sm font-bold',
						variant === 'green' && 'text-green',
						variant === 'warning' && 'text-gold',
						variant === 'red' && 'text-red',
					)}
				>
					<Calendar className="h-3.5 w-3.5" /> Apostas das {stageLabel} abertas
				</div>
				<div className="mt-1 text-xs text-sub">
					Prazo: {formatDeadline(open.deadline)} · {palpited}/{total} palpitado
					{open.importedMatchCount < open.expectedMatchCount && (
						<>
							{' '}
							· {open.importedMatchCount}/{open.expectedMatchCount} partidas importadas
						</>
					)}
				</div>
			</div>
			<ChevronRight
				className={cn('h-5 w-5', variant === 'green' && 'text-green', variant === 'warning' && 'text-gold', variant === 'red' && 'text-red')}
			/>
		</button>
	)
}
