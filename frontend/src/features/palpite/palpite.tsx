import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PhaseStatus } from '@bolao/shared'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { Card, CardHeader, CardBody, Button } from 'reactstrap'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

import If from '../../app/components/if'
import TeamCrest from '../../app/components/TeamCrest'
import { phaseIsOpen, teamLabel } from '../../lib/domain'
import {
	getPalpitesAsync,
	selectGrupos,
	PalpiteType,
	handleGrupos,
	updatePalpitesAsync,
	selectTabIndex,
} from './palpiteSlice'
import { selectFase, selectFaseById } from '../fase/faseSlice'
import { selectAuthUser } from '../../app/auth/authSlice'

type InputType = HTMLInputElement | null

const palpite = () => {
	const { faseId } = useParams<{ faseId: string }>()
	const dispatch = useAppDispatch()

	const authUser = useAppSelector(selectAuthUser)
	const fase = useAppSelector(selectFase)
	const grupos = useAppSelector(selectGrupos)
	const tabIndex = useAppSelector(selectTabIndex)

	useEffect(() => {
		if (authUser) {
			dispatch(selectFaseById(faseId!))
			dispatch(getPalpitesAsync({ userId: authUser._id!, faseId: faseId!, callback: () => {} }))
		}
	}, [faseId, authUser, dispatch])

	useEffect(() => {
		if (fase && phaseIsOpen(fase.status)) {
			focus()
		}
	})

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, palpite: PalpiteType) => {
		const name: 'homeTeamScore' | 'awayTeamScore' = event.currentTarget.name as 'homeTeamScore' | 'awayTeamScore'
		const currentTabIndex = event.currentTarget.tabIndex
		if (event.key === 'Backspace' && event.currentTarget.value === '' && currentTabIndex > 0) {
			const newPalpite: PalpiteType = { ...palpite }
			newPalpite[name] = undefined
			dispatch(handleGrupos({ palpite: newPalpite, tabIndex: currentTabIndex - 1 }))
			event.preventDefault()
		}
	}

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>, palpite: PalpiteType) => {
		event.preventDefault()
		const name: 'homeTeamScore' | 'awayTeamScore' = event.target.name as 'homeTeamScore' | 'awayTeamScore'
		const currentTabIndex = event.target.tabIndex
		let value: string | number | undefined = event.target.value
		if (
			value === '0' ||
			value === '1' ||
			value === '2' ||
			value === '3' ||
			value === '4' ||
			value === '5' ||
			value === '6' ||
			value === '7' ||
			value === '8' ||
			value === '9' ||
			value === '' ||
			value === null ||
			value === undefined
		) {
			value = value === '' || value === undefined || value === null ? undefined : Number(value)
			const newPalpite: PalpiteType = { ...palpite }
			newPalpite[name] = value
			dispatch(
				handleGrupos({
					palpite: newPalpite,
					tabIndex: value !== undefined ? currentTabIndex + 1 : currentTabIndex,
				}),
			)
		}
	}

	const handleClick = (event: React.MouseEvent) => {
		event.preventDefault()
		const palpites: PalpiteType[] = []
		if (grupos) {
			grupos.forEach((grupo) => {
				grupo.rodadas.forEach((rodada) => {
					rodada.bets.forEach((bet) => {
						palpites.push(bet)
					})
				})
			})
		}
		dispatch(
			updatePalpitesAsync({
				palpites,
				userId: authUser!._id!,
				faseId: faseId!,
				callback: () => {
					toast.success('Seus palpites foram salvos, agora é só torcer!')
				},
			}),
		)
	}

	const inputTabIndex: InputType[] = []
	const focus = () => {
		inputTabIndex[tabIndex]?.focus()
	}

	let inputIndex = 0

	return (
		<div className='row'>
			<form style={{ width: '100%', height: '100%', display: 'contents' }}>
				<div className='col-12'>
					<Card>
						<CardHeader>
							Preencha seus palpites e boa sorte!
							<If test={fase !== undefined && phaseIsOpen(fase.status)}>
								<Button size='sm' color='success' className='float-right' onClick={handleClick}>
									<i className='fas fa-save'></i> Salvar
								</Button>
							</If>
						</CardHeader>
						<CardBody className='p-0'>
							<div className='row' style={{ margin: '0px' }}>
								{grupos &&
									grupos.map((grupo, idx) => (
										<div
											key={idx}
											className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-4'
											style={{ padding: '0px' }}
										>
											<Card className='card-grupos'>
												<If test={grupo.nome !== ''}>
													<CardHeader className='text-center bg-light-blue text-white nomeGrupo'>
														{grupo.nome}
													</CardHeader>
												</If>
												<CardBody className='card-body-grupos'>
													{grupo.rodadas.map((rodada, idx2) => (
														<div key={idx2}>
															<If test={rodada.nome !== ''}>
																<div className='text-center bg-gray-200 nomeRodada'>
																	<strong>Rodada {rodada.nome}</strong>
																</div>
															</If>
															{rodada.bets.map((bet, idx3) => {
																const timeAIndex = inputIndex++
																const timeBIndex = inputIndex++
																const match = bet.match!
																return (
																	<div
																		key={idx3 + '-' + bet.homeTeamScore + '-' + bet.awayTeamScore}
																		className='bg-gray-100 rodada p-2'
																	>
																		<div className='nomeTimeA'>
																			<span className='h6 nomeTimeA'>
																				{teamLabel(match.homeTeam)}
																			</span>
																		</div>
																		<div className='bandeiraTimeA'>
																			<TeamCrest team={match.homeTeam} className='bandeiraTimeA' />
																		</div>
																		<div className='palpiteTimeA'>
																			<input
																				id={`${bet._id}_home`}
																				name='homeTeamScore'
																				type='text'
																				className='palpiteTimeA form-control'
																				maxLength={1}
																				disabled={fase && fase.status !== PhaseStatus.OPEN}
																				tabIndex={timeAIndex}
																				ref={(input) => {
																					inputTabIndex[timeAIndex] = input
																				}}
																				value={bet.homeTeamScore ?? ''}
																				onKeyDown={(e) => handleKeyDown(e, bet)}
																				onChange={(e) => handleChange(e, bet)}
																			/>
																		</div>
																		<div className='divisorPalpite'>x</div>
																		<div className='palpiteTimeB'>
																			<input
																				id={`${bet._id}_away`}
																				name='awayTeamScore'
																				type='text'
																				className='palpiteTimeB form-control'
																				maxLength={1}
																				disabled={fase && fase.status !== PhaseStatus.OPEN}
																				tabIndex={timeBIndex}
																				ref={(input) => {
																					inputTabIndex[timeBIndex] = input
																				}}
																				value={bet.awayTeamScore ?? ''}
																				onKeyDown={(e) => handleKeyDown(e, bet)}
																				onChange={(e) => handleChange(e, bet)}
																			/>
																		</div>
																		<div className='bandeiraTimeB'>
																			<TeamCrest team={match.awayTeam} className='bandeiraTimeB' />
																		</div>
																		<div className='nomeTimeB'>
																			<span className='h6 nomeTimeB'>
																				{teamLabel(match.awayTeam)}
																			</span>
																		</div>
																		<div className='horaPartida'>
																			<span className='horaPartida text-secundary'>
																				{format(new Date(match.utcDate), 'dd/MM/yyyy HH:mm')}
																			</span>
																		</div>
																	</div>
																)
															})}
														</div>
													))}
												</CardBody>
											</Card>
										</div>
									))}
							</div>
						</CardBody>
					</Card>
				</div>
			</form>
		</div>
	)
}

export default palpite
