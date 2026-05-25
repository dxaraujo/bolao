import { StageState } from '@bolao/shared'

import { Badge } from '@/components/ui/badge'

interface StageBadgeProps {
	state: StageState
}

export function StageBadge({ state }: StageBadgeProps) {
	if (state === StageState.OPEN) return <Badge tone="green">Aberto</Badge>
	if (state === StageState.CLOSED) return <Badge tone="sub">Encerrado</Badge>
	return <Badge tone="sub">Em Breve</Badge>
}
