import { useEffect, useState } from 'react'
import { PhaseStatus } from '@bolao/shared'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { Card, CardHeader, CardBody, Table, Input } from 'reactstrap'

import TeamCrest from '../../app/components/TeamCrest'
import { matchHasResult, sortMatchesByDate, teamLabel } from '../../lib/domain'
import { getUsersAsync, selectUsers } from '../user/userSlice'
import { getPartidasAsync, MatchType, selectPartidas } from '../partida/partidaSlice'
import { FaseType, getFasesAsync, selectFases } from '../fase/faseSlice'
import { PalpiteType } from './palpiteSlice'

const filtrarPartidas = (
	fases?: FaseType[],
	partidas?: MatchType[],
	partidaId?: string,
): MatchType[] => {
	return (
		partidas?.filter((partida) => {
			const fase = fases?.find((f) => f.stage === partida.stage)
			if (!fase) return false
			const testPartidaId = partidaId ? partidaId === 'TODAS' || partida._id === partidaId : true
			return fase.status === PhaseStatus.BLOCKED && testPartidaId
		}) ?? []
	)
}

const encontrarUltimaClassificacao = (partidas: MatchType[]): string | undefined => {
	let ultimaClassificacao: string | undefined
	sortMatchesByDate(partidas).forEach((partida) => {
		if (matchHasResult(partida)) {
			ultimaClassificacao = partida._id
		}
	})
	return ultimaClassificacao
}

const findBetForMatch = (bets: PalpiteType[] | undefined, matchId: number) =>
	bets?.find((b) => b.match?.id === matchId)

const palpites = () => {
	const dispatch = useAppDispatch()
	const fases = useAppSelector(selectFases)
	const partidas = useAppSelector(selectPartidas)
	const users = useAppSelector(selectUsers)

	const [partidaId, setPartidaId] = useState('TODAS')

	useEffect(() => {
		dispatch(getFasesAsync())
		dispatch(getPartidasAsync())
		dispatch(getUsersAsync())
	}, [dispatch])

	useEffect(() => {
		const partidasFiltered = filtrarPartidas(fases, partidas)
		const ultimaPartida = encontrarUltimaClassificacao(partidasFiltered)
		setPartidaId(ultimaPartida ?? 'TODAS')
	}, [fases, partidas])

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPartidaId(event.target.value)
	}

	return (
		<Card>
			<CardHeader className='d-flex align-items-center justify-content-between'>
				<span>Visualizar palpites</span>
				<div>
					<Input id='partidaId' type='select' value={partidaId || 'TODAS'} onChange={handleChange}>
						<option value='TODAS'>Todas as partidas</option>
						{sortMatchesByDate(filtrarPartidas(fases, partidas)).map((partida) => (
							<option key={partida._id} value={partida._id}>
								{`${teamLabel(partida.homeTeam)} x ${teamLabel(partida.awayTeam)}`}
							</option>
						))}
					</Input>
				</div>
			</CardHeader>
			<CardBody style={{ padding: '0px' }}>
				{filtrarPartidas(fases, partidas, partidaId).map((partida) => (
					<Card key={partida._id} style={{ marginBottom: '0px' }}>
						<CardHeader>{`${teamLabel(partida.homeTeam)} ${partida.homeTeamScore ?? ''} x ${partida.awayTeamScore ?? ''} ${teamLabel(partida.awayTeam)}`}</CardHeader>
						<CardBody style={{ padding: '0px' }}>
							<Table responsive striped borderless>
								<thead>
									<tr className='gridPalpites'>
										<th className='text-center'>#</th>
										<th>Nome</th>
										<th className='text-center'>Palpite</th>
									</tr>
								</thead>
								<tbody>
									{users &&
										[...users]
											.sort((u1, u2) => u1.classificacao! - u2.classificacao!)
											.map((user, idx) => {
												const bet = findBetForMatch(user.bets, partida.id)
												return (
													<tr key={idx} className='gridPalpites'>
														<td className='text-center'>{idx + 1}</td>
														<td>{user.name}</td>
														<td className='text-center' style={{ justifySelf: 'center' }}>
															<div key={idx} className='rodadaPalpites'>
																<div className='bandeiraTimeA'>
																	<TeamCrest team={partida.homeTeam} className='bandeiraTimeA' />
																</div>
																<div className='palpiteTimeA'>{bet?.homeTeamScore ?? ''}</div>
																<div className='divisorPalpite'>x</div>
																<div className='palpiteTimeB'>{bet?.awayTeamScore ?? ''}</div>
																<div className='bandeiraTimeB'>
																	<TeamCrest team={partida.awayTeam} className='bandeiraTimeB' />
																</div>
															</div>
														</td>
													</tr>
												)
											})}
								</tbody>
							</Table>
						</CardBody>
					</Card>
				))}
			</CardBody>
		</Card>
	)
}

export default palpites
