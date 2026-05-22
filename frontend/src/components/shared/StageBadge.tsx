import { StageStatus } from '@bolao/shared'

import { Badge } from '@/components/ui/badge'

interface StageBadgeProps {
	status: StageStatus
}

export function StageBadge({ status }: StageBadgeProps) {
	if (status === StageStatus.OPEN) return <Badge tone="green">Aberto</Badge>
	if (status === StageStatus.BLOCKED) return <Badge tone="sub">Encerrado</Badge>
	return <Badge tone="sub">Em Breve</Badge>
}
