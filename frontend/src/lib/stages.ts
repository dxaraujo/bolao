import { MatchStage } from '@/lib/enums'

export const STAGE_ORDER: MatchStage[] = [
  MatchStage.GROUP_STAGE,
  MatchStage.LAST_16,
  MatchStage.QUARTER_FINALS,
  MatchStage.SEMI_FINALS,
  MatchStage.THIRD_PLACE,
  MatchStage.FINAL,
]

export const STAGE_LABELS: Record<MatchStage, { name: string; short: string }> = {
  [MatchStage.GROUP_STAGE]: { name: 'Fase de Grupos', short: 'Grupos' },
  [MatchStage.LAST_16]: { name: 'Oitavas de Final', short: 'Oitavas' },
  [MatchStage.LAST_32]: { name: '32 avos de Final', short: '32 avos' },
  [MatchStage.QUARTER_FINALS]: { name: 'Quartas de Final', short: 'Quartas' },
  [MatchStage.SEMI_FINALS]: { name: 'Semifinal', short: 'Semi' },
  [MatchStage.THIRD_PLACE]: { name: '3º Lugar', short: '3º Lugar' },
  [MatchStage.FINAL]: { name: 'Final', short: 'Final' },
}
