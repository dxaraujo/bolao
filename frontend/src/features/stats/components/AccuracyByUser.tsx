import type { UserAccuracy } from '@bolao/shared'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface AccuracyByUserProps {
	users: UserAccuracy[]
}

export function AccuracyByUser({ users }: AccuracyByUserProps) {
	return (
		<Card className="animate-fade-up p-3">
			<div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-sub">% Acerto por jogador</div>
			<div className="flex flex-col gap-3">
				{users.map((u) => (
					<div key={u._id}>
						<div className="flex items-center justify-between text-xs">
							<span className="font-bold">{u.name}</span>
							<span className="font-bold text-sub">
								{u.exactScore}E · {u.correctBets}R · {u.wrong}X
							</span>
						</div>
						<Progress value={u.totalBets === 0 ? 0 : (u.exactScore / u.totalBets) * 100} className="mt-1.5" />
					</div>
				))}
			</div>
			<div className="mt-3 flex gap-3 border-t border-border pt-2 text-[10px] text-sub">
				<span className="flex items-center gap-1">
					<span className="h-2 w-2 rounded-full bg-acc" /> E = Exato
				</span>
				<span className="flex items-center gap-1">
					<span className="h-2 w-2 rounded-full bg-gold" /> R = Resultado
				</span>
				<span className="flex items-center gap-1">
					<span className="h-2 w-2 rounded-full bg-red" /> X = Errou
				</span>
			</div>
		</Card>
	)
}
