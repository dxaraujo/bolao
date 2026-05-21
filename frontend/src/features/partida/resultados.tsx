import { useEffect } from 'react'
import { format } from 'date-fns'
import { Card, CardHeader, CardBody } from 'reactstrap'

import TeamCrest from '../../app/components/TeamCrest'
import { sortMatchesByDate, teamLabel } from '../../lib/domain'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { getResultadosAsync, selectPartidas } from './partidaSlice'

const Resultados = () => {
	const dispatch = useAppDispatch()
	const partidas = useAppSelector(selectPartidas)

	useEffect(() => {
		dispatch(getResultadosAsync())
	}, [dispatch])

	return (
		<Card>
			<CardHeader>Resultados</CardHeader>
			<CardBody style={{ padding: '0px' }}>
				<table className='table table-striped table-borderless'>
					<tbody>
						{partidas &&
							sortMatchesByDate(partidas).map((partida) => (
								<tr key={partida._id} className='gridResultadosView'>
									<td className='text-center'>
										<div className='rodada'>
											<div className='nomeTimeA'>
												<span className='h6 nomeTimeA'>{teamLabel(partida.homeTeam)}</span>
											</div>
											<div className='bandeiraTimeA'>
												<TeamCrest team={partida.homeTeam} className='bandeiraTimeA' />
											</div>
											<div className='palpiteTimeA'>{partida.homeTeamScore}</div>
											<div className='divisorPalpite'>x</div>
											<div className='palpiteTimeB'>{partida.awayTeamScore}</div>
											<div className='bandeiraTimeB'>
												<TeamCrest team={partida.awayTeam} className='bandeiraTimeB' />
											</div>
											<div className='nomeTimeB'>
												<span className='h6 nomeTimeB'>{teamLabel(partida.awayTeam)}</span>
											</div>
											<div className='horaPartida'>
												<span className='horaPartida text-secundary'>
													{partida.utcDate
														? format(new Date(partida.utcDate), 'dd/MM/yyyy HH:mm:ss')
														: ''}
												</span>
											</div>
										</div>
									</td>
								</tr>
							))}
					</tbody>
				</table>
			</CardBody>
		</Card>
	)
}

export default Resultados
