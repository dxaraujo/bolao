import type { TeamType } from '../../features/time/timeSlice'

type TeamCrestProps = {
	team?: TeamType
	className?: string
	height?: number
}

const TeamCrest = ({ team, className, height = 20 }: TeamCrestProps) => {
	if (team?.crest) {
		return (
			<img
				src={team.crest}
				alt={team.tla ?? team.name ?? ''}
				className={className}
				style={{ height, width: 'auto', margin: 0 }}
			/>
		)
	}
	return <i className={`flag-icon flag-icon-xx ${className ?? ''}`} style={{ margin: 0 }} />
}

export default TeamCrest
