import { ChevronRight, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { StageStatus, type BetListItem, type StageVisibleItem } from '@bolao/shared'

import { STAGE_LABELS } from '@/lib/stage'
import { formatDeadline } from '@/lib/format'
import { cn } from '@/lib/cn'

interface OpenStageBannerProps {
	stages: StageVisibleItem[]
	bets: BetListItem[]
}

type BannerVariant = 'green' | 'warning' | 'red'

function getBannerVariant(deadline: string | undefined, stageBets: BetListItem[]): BannerVariant {
	const hasInvalidBet = stageBets.some(
		(b) => (b.homeTeamScore != null) !== (b.awayTeamScore != null),
	)

	if (deadline) {
		const hoursLeft = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60)
		if (hoursLeft <= 1) return 'red'
		if (hoursLeft <= 12 || hasInvalidBet) return 'warning'
	} else if (hasInvalidBet) {
		return 'warning'
	}

	return 'green'
}

export function OpenStageBanner({ stages, bets }: OpenStageBannerProps) {
	const navigate = useNavigate()
	const open = stages.find((s) => s.status === StageStatus.OPEN)
	if (!open) return null

	const stageBets = bets.filter((b) => b.stage === open.matchStage)
	const count = stageBets.length
	const stageLabel = STAGE_LABELS[open.matchStage]?.full ?? open.matchStage
	const variant = getBannerVariant(open.deadline, stageBets)

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
					{open.deadline ? `Prazo: ${formatDeadline(open.deadline)} · ` : ''}
					{count} jogo{count === 1 ? '' : 's'}
				</div>
			</div>
			<ChevronRight
				className={cn(
					'h-5 w-5',
					variant === 'green' && 'text-green',
					variant === 'warning' && 'text-gold',
					variant === 'red' && 'text-red',
				)}
			/>
		</button>
	)
}
