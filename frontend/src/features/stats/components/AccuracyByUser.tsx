import { SCORING_RULES, type UserAccuracy } from '@bolao/shared'
import { CircleDot, Goal, Target, Trophy, X, type LucideIcon } from 'lucide-react'

import { Card } from '@/components/ui/card'

interface AccuracyByUserProps {
	users: UserAccuracy[]
}

const LEGEND: Array<{ icon: LucideIcon; label: string; color: string; tone: string }> = [
	{ icon: Trophy, label: 'Exato', color: 'rgb(var(--green))', tone: 'text-green' },
	{ icon: Goal, label: 'Venc+Gol', color: 'rgb(var(--acc))', tone: 'text-acc' },
	{ icon: Target, label: 'Vencedor', color: 'rgb(var(--gold))', tone: 'text-gold' },
	{ icon: CircleDot, label: 'Gol', color: 'rgb(var(--purple))', tone: 'text-purple' },
	{ icon: X, label: 'Errou', color: 'rgb(var(--red))', tone: 'text-red' },
]

function pointsOf(u: UserAccuracy): number {
	return (
		u.exactScore * SCORING_RULES.exactScore +
		u.winnerWithGoal * SCORING_RULES.winnerWithGoal +
		u.correctWinner * SCORING_RULES.correctWinner +
		u.oneGoalCorrect * SCORING_RULES.oneGoalCorrect
	)
}

export function AccuracyByUser({ users }: AccuracyByUserProps) {
	const leaderPoints = users.reduce((max, u) => Math.max(max, pointsOf(u)), 0)
	return (
		<Card className="animate-fade-up p-3">
			<div className="mb-3 text-xs font-bold uppercase tracking-wider text-sub">% Acerto por jogador</div>
			<div className="flex flex-col gap-3">
				{users.map((u) => {
					const points = pointsOf(u)
					const barPct = leaderPoints === 0 ? 0 : (points / leaderPoints) * 100
					return (
						<div key={u._id}>
							<div className="flex items-center justify-between text-sm">
								<span className="font-bold">{u.name}</span>
								<span className="flex items-center gap-2 font-bold">
									<span className="inline-flex items-center gap-0.5 text-green">
										<Trophy className="h-3 w-3" />
										{u.exactScore}
									</span>
									<span className="inline-flex items-center gap-0.5 text-acc">
										<Goal className="h-3 w-3" />
										{u.winnerWithGoal}
									</span>
									<span className="inline-flex items-center gap-0.5 text-gold">
										<Target className="h-3 w-3" />
										{u.correctWinner}
									</span>
									<span className="inline-flex items-center gap-0.5 text-purple">
										<CircleDot className="h-3 w-3" />
										{u.oneGoalCorrect}
									</span>
									<span className="inline-flex items-center gap-0.5 text-red">
										<X className="h-3 w-3" />
										{u.wrong}
									</span>
								</span>
							</div>
							<div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full transition-[width] duration-700 ease-out"
									style={{
										width: `${barPct}%`,
										background: `linear-gradient(90deg, rgb(var(--acc) / 0.5), rgb(var(--acc)))`,
									}}
								/>
							</div>
						</div>
					)
				})}
			</div>
			<div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-2 text-xs text-sub">
				{LEGEND.map(({ icon: Icon, label, tone }) => (
					<span key={label} className="flex items-center gap-1">
						<Icon className={`h-3 w-3 ${tone}`} />
						{label}
					</span>
				))}
			</div>
		</Card>
	)
}
