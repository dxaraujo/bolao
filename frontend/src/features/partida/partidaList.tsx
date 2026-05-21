import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhaseStatus } from '@bolao/shared'
import { Card, CardHeader, CardBody, Table, ButtonGroup, Button } from 'reactstrap'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { format } from 'date-fns'

import If from '../../app/components/if'
import { rootUser } from '../../app/config/config'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { sortMatchesByDate, teamLabel } from '../../lib/domain'
import {
	getPartidasAsync,
	deletePartidaAsync,
	selectPartidas,
	select,
	create,
	MatchType,
} from './partidaSlice'
import { selectAuthUser } from '../../app/auth/authSlice'
import { selectFases } from '../fase/faseSlice'

const PartidaList = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const authUser = useAppSelector(selectAuthUser)
	const partidas = useAppSelector(selectPartidas)
	const fases = useAppSelector(selectFases)

	useEffect(() => {
		dispatch(getPartidasAsync())
	}, [dispatch])

	const add = () => {
		dispatch(create())
		navigate('/partida/create')
	}

	const update = (partida: MatchType) => {
		dispatch(select(partida))
		navigate('/partida/update')
	}

	const prepareDelete = (partida: MatchType) => {
		Swal.fire({
			title: 'Você tem certeza?',
			text: 'Depois de deletado, você não poderá recupear os dados!',
			icon: 'warning',
			showConfirmButton: true,
			showCancelButton: true,
		}).then((result) => {
			if (result.isConfirmed) {
				dispatch(
					deletePartidaAsync({
						partida,
						callback: () => toast.success('Partida apagada com sucesso!'),
					}),
				)
			} else {
				Swal.fire('A operação foi cancelada!', '', 'error')
			}
		})
	}

	const desabilitado = (stage: string | undefined) => {
		const fase = fases.find((f) => f.stage === stage) || { status: PhaseStatus.DISABLED }
		return fase.status === PhaseStatus.DISABLED
	}

	return (
		<Card>
			<CardHeader>
				Lista de Partidas
				<If test={rootUser === authUser?.email}>
					<Button color='success' size='sm' className='float-right mb-0' onClick={add}>
						<i className='fas fa-plus-circle'></i> Adicionar
					</Button>
				</If>
			</CardHeader>
			<CardBody style={{ padding: '0px' }}>
				<Table responsive striped borderless>
					<thead>
						<tr className='gridPartidas'>
							<th className='text-center'>#</th>
							<th>TimeA</th>
							<th>TimeB</th>
							<th>Data</th>
							<th className='text-center'></th>
						</tr>
					</thead>
					<tbody>
						{partidas &&
							sortMatchesByDate(partidas).map((partida, idx) => (
								<tr key={partida._id ?? idx} className='gridPartidas'>
									<td className='text-center'>{partida.id}</td>
									<td>{teamLabel(partida.homeTeam)}</td>
									<td>{teamLabel(partida.awayTeam)}</td>
									<th>
										{partida.utcDate
											? format(new Date(partida.utcDate), 'dd/MM/yyyy HH:mm:ss')
											: ''}
									</th>
									<td className='text-center'>
										<If test={desabilitado(partida.stage)}>
											<ButtonGroup>
												<Button
													className='text-white'
													size='sm'
													color='warning'
													onClick={() => update(partida)}
												>
													<i className='fas fa-edit'></i>
												</Button>
												<If test={rootUser === authUser?.email}>
													<Button size='sm' color='danger' onClick={() => prepareDelete(partida)}>
														<i className='fas fa-trash-alt'></i>
													</Button>
												</If>
											</ButtonGroup>
										</If>
									</td>
								</tr>
							))}
					</tbody>
				</Table>
			</CardBody>
		</Card>
	)
}

export default PartidaList
