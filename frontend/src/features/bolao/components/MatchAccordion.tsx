import type { GroupedBet } from '@bolao/shared'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { TeamCrest } from '@/components/shared/TeamCrest'
import { formatMatchDate } from '@/lib/format'

import { BetRow } from './BetRow'

interface MatchAccordionProps {
	groups: GroupedBet[]
	currentUserId?: string
}

export function MatchAccordion({ groups, currentUserId }: MatchAccordionProps) {
	return (
		<Accordion type="multiple" className="flex flex-col gap-2">
			{groups.map((g) => {
				const correctTotal = g.winnerWithGoal + g.correctWinner + g.oneGoalCorrect
				return (
					<AccordionItem key={g.matchId} value={g.matchId} className="animate-fade-up">
						<AccordionTrigger className="px-4 py-3">
							<div className="flex w-full flex-col gap-3">
								<div className="flex items-center justify-between">
									<span className="text-xs font-bold uppercase tracking-wider text-sub">
										{formatMatchDate(g.utcDate)}
									</span>
									<div className="flex gap-1.5">
										{g.exactScore > 0 && <Badge tone="green">🎯 {g.exactScore}</Badge>}
										{correctTotal > 0 && <Badge tone="gold">✓ {correctTotal}</Badge>}
										{g.wrong > 0 && <Badge tone="red">✗ {g.wrong}</Badge>}
									</div>
								</div>
								<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
									<div className="flex flex-col items-center gap-1 text-center">
										<TeamCrest src={g.homeTeam.crest} alt={g.homeTeam.tla} size={40} />
										<span className="text-sm font-bold">{g.homeTeam.shortName ?? g.homeTeam.name}</span>
									</div>
									<div className="text-center">
										<div className="text-xs uppercase tracking-wider text-sub">Resultado</div>
										<div className="font-display text-2xl tracking-widest">
											{g.homeTeamScore ?? '-'}&nbsp;–&nbsp;{g.awayTeamScore ?? '-'}
										</div>
									</div>
									<div className="flex flex-col items-center gap-1 text-center">
										<TeamCrest src={g.awayTeam.crest} alt={g.awayTeam.tla} size={40} />
										<span className="text-sm font-bold">{g.awayTeam.shortName ?? g.awayTeam.name}</span>
									</div>
								</div>
							</div>
						</AccordionTrigger>
						<AccordionContent>
							<div className="grid grid-cols-[1fr_56px_104px_44px] gap-2 bg-surface-2 px-4 py-2 text-xs font-bold uppercase tracking-wide text-sub">
								<span>Jogador</span>
								<span className="text-center">Palpite</span>
								<span className="text-center">Resultado</span>
								<span className="text-center">Pts</span>
							</div>
							<div className="divide-y divide-border">
								{g.bets.map((b) => (
									<BetRow key={b.user._id} bet={b} isMe={b.user._id === currentUserId} />
								))}
							</div>
							<div className="flex items-center justify-between border-t border-border bg-surface-2 px-4 py-2 text-xs">
								<span className="font-bold text-sub">
									{g.total} palpite{g.total === 1 ? '' : 's'}
								</span>
								<div className="flex gap-3 font-bold">
									<span className="text-green">🎯 {g.exactScore}</span>
									<span className="text-gold">✓ {correctTotal}</span>
									<span className="text-red">✗ {g.wrong}</span>
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>
				)
			})}
		</Accordion>
	)
}
