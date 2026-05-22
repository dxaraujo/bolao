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

export function OpenStageBanner({ stages, bets }: OpenStageBannerProps) {
	const navigate = useNavigate()
	const open = stages.find((s) => s.status === StageStatus.OPEN)
	if (!open) return null

	const count = bets.filter((b) => b.stage === open.matchStage).length
	const stageLabel = STAGE_LABELS[open.matchStage]?.full ?? open.matchStage

	return (
		<button
			type="button"
			onClick={() => navigate('/apostas')}
			className={cn(
				'flex w-full items-center justify-between rounded-lg border border-green/30 bg-green/10 px-4 py-3 text-left transition-colors hover:bg-green/15',
			)}
		>
			<div>
				<div className="flex items-center gap-2 text-sm font-bold text-green">
					<Calendar className="h-3.5 w-3.5" /> Apostas das {stageLabel} abertas
				</div>
				<div className="mt-1 text-xs text-sub">
					{open.deadline ? `Prazo: ${formatDeadline(open.deadline)} · ` : ''}
					{count} jogo{count === 1 ? '' : 's'}
				</div>
			</div>
			<ChevronRight className="h-5 w-5 text-green" />
		</button>
	)
}
