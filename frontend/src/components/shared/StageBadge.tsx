import { Badge } from '@/components/ui/badge'
import type { StageStatus } from '@/types'

const MAP: Record<StageStatus, { variant: 'open' | 'blocked' | 'disabled'; label: string }> = {
  OPEN:     { variant: 'open',     label: 'Aberto'    },
  BLOCKED:  { variant: 'blocked',  label: 'Encerrado' },
  DISABLED: { variant: 'disabled', label: 'Em Breve'  },
}

export function StageBadge({ status }: { status: StageStatus }) {
  const { variant, label } = MAP[status]
  return <Badge variant={variant}>{label}</Badge>
}
