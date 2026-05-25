import type { GroupedBetMatch } from '@bolao/shared'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { TeamCrest } from '@/components/shared/TeamCrest'
import { formatMatchDate } from '@/lib/format'
import { teamShortName } from '@/lib/team-names'

import { BetRow } from './BetRow'

interface MatchAccordionProps {
	groups: GroupedBetMatch[]
	currentUserId?: string
}

export function MatchAccordion({ groups, currentUserId }: MatchAccordionProps) {
	return (
		<Accordion type="multiple" className="flex flex-col gap-2">
			{groups.map((g) => {
				const correctTotal = g.totals.winnerWithGoal + g.totals.correctWinner + g.totals.oneGoalCorrect
				const { match } = g
				return (
					<AccordionItem key={match._id} value={match._id} className="animate-fade-up">
						<AccordionTrigger className="px-4 py-3">
							<div className="flex w-full flex-col gap-3">
								<div className="flex items-center justify-between">
									<span className="text-xs font-bold uppercase tracking-wider text-sub">
										{formatMatchDate(match.utcDate)}
									</span>
									<div className="flex gap-1.5">
										{g.totals.exactScore > 0 && <Badge tone="green">🎯 {g.totals.exactScore}</Badge>}
										{correctTotal > 0 && <Badge tone="gold">✓ {correctTotal}</Badge>}
										{g.totals.wrong > 0 && <Badge tone="red">✗ {g.totals.wrong}</Badge>}
									</div>
								</div>
								<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
									<div className="flex flex-col items-center gap-1 text-center">
										<TeamCrest team={match.homeTeam} size={40} />
										<span className="text-sm font-bold">{teamShortName(match.homeTeam)}</span>
									</div>
									<div className="text-center">
										<div className="text-xs uppercase tracking-wider text-sub">Resultado</div>
										<div className="font-display text-3xl tracking-widest">
											{match.score?.home ?? '-'}&nbsp;–&nbsp;{match.score?.away ?? '-'}
										</div>
									</div>
									<div className="flex flex-col items-center gap-1 text-center">
										<TeamCrest team={match.awayTeam} size={40} />
										<span className="text-sm font-bold">{teamShortName(match.awayTeam)}</span>
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
								{[...g.participants]
									.sort((a, b) => {
										const ptsDiff = (b.result?.points ?? 0) - (a.result?.points ?? 0)
										if (ptsDiff !== 0) return ptsDiff
										return a.user.name.localeCompare(b.user.name)
									})
									.map((p) => (
										<BetRow key={p.user._id} participant={p} isMe={p.user._id === currentUserId} />
									))}
							</div>
							<div className="flex items-center justify-between border-t border-border bg-surface-2 px-4 py-2 text-xs">
								<span className="font-bold text-sub">
									{g.totals.total} participante{g.totals.total === 1 ? '' : 's'} · {g.totals.notBet} não palpitaram
								</span>
								<div className="flex gap-3 font-bold">
									<span className="text-green">🎯 {g.totals.exactScore}</span>
									<span className="text-gold">✓ {correctTotal}</span>
									<span className="text-red">✗ {g.totals.wrong}</span>
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>
				)
			})}
		</Accordion>
	)
}
