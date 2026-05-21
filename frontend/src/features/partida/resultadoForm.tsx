import { useState } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { ButtonGroup, Button } from 'reactstrap'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

import If from '../../app/components/if'
import TeamCrest from '../../app/components/TeamCrest'
import { teamLabel } from '../../lib/domain'
import { MatchType, handleResultado, getResultadosAsync, updateResultadoAsync } from './partidaSlice'

const ReadOnlyRow = (props: {
	idx: number
	partida: MatchType
	edit: () => void
	atualizandoPontuacoes: boolean
}) => {
	const { idx, partida, edit, atualizandoPontuacoes } = props
	return (
		<tr key={partida._id} className='gridResultados'>
			<td className='text-center'>{idx + 1}</td>
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
							{partida.utcDate ? format(new Date(partida.utcDate), 'dd/MM/yyyy HH:mm:ss') : ''}
						</span>
					</div>
				</div>
			</td>
			<td className='text-center'>
				<If test={!atualizandoPontuacoes}>
					<ButtonGroup>
						<Button className='text-white' size='sm' color='warning' onClick={edit}>
							<i className='fas fa-edit'></i>
						</Button>
					</ButtonGroup>
				</If>
			</td>
		</tr>
	)
}

const EditableRow = (props: {
	idx: number
	partida: MatchType
	handleChange: (event: React.ChangeEvent<HTMLInputElement>, partida: MatchType) => void
	update: (partida: MatchType) => void
	cancel: () => void
}) => {
	const { idx, partida, handleChange, update, cancel } = props
	return (
		<tr key={partida._id} className='gridResultados'>
			<td className='text-center'>{idx + 1}</td>
			<td className='text-center'>
				<div className='rodada'>
					<div className='nomeTimeA'>
						<span className='h6 nomeTimeA'>{teamLabel(partida.homeTeam)}</span>
					</div>
					<div className='bandeiraTimeA'>
						<TeamCrest team={partida.homeTeam} className='bandeiraTimeA' />
					</div>
					<div className='palpiteTimeA'>
						<input
							name='homeTeamScore'
							type='text'
							className='palpiteTimeA form-control'
							maxLength={1}
							value={partida.homeTeamScore ?? ''}
							onChange={(event) => handleChange(event, partida)}
						/>
					</div>
					<div className='divisorPalpite'>x</div>
					<div className='palpiteTimeB'>
						<input
							name='awayTeamScore'
							type='text'
							className='palpiteTimeB form-control'
							maxLength={1}
							value={partida.awayTeamScore ?? ''}
							onChange={(event) => handleChange(event, partida)}
						/>
					</div>
					<div className='bandeiraTimeB'>
						<TeamCrest team={partida.awayTeam} className='bandeiraTimeB' />
					</div>
					<div className='nomeTimeB'>
						<span className='h6 nomeTimeB'>{teamLabel(partida.awayTeam)}</span>
					</div>
					<div className='horaPartida'>
						<span className='horaPartida text-secundary'>
							{partida.utcDate ? format(new Date(partida.utcDate), 'dd/MM/yyyy HH:mm:ss') : ''}
						</span>
					</div>
				</div>
			</td>
			<td className='text-center'>
				<ButtonGroup>
					<Button size='sm' color='success' onClick={() => update(partida)}>
						<i className='fas fa-check fa-fw'></i>
					</Button>
					<Button size='sm' color='danger' onClick={cancel}>
						<i className='fas fa-times fa-fw'></i>
					</Button>
				</ButtonGroup>
			</td>
		</tr>
	)
}

type PartidaFormType = {
	index: number
	partida: MatchType
	atualizandoPontuacoes: boolean
}

const partidaForm = (props: PartidaFormType) => {
	const dispatch = useAppDispatch()
	const [isReadOnly, setIsReadOnly] = useState(true)
	const edit = () => {
		setIsReadOnly(false)
	}
	const cancel = () => {
		dispatch(getResultadosAsync())
		setIsReadOnly(true)
	}
	const update = (partida: MatchType) => {
		dispatch(
			updateResultadoAsync({
				partida,
				callback: () => {
					toast.success('Partida atualizado com sucesso!')
					setIsReadOnly(true)
				},
			}),
		)
	}
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>, partida: MatchType) => {
		event.preventDefault()
		const name = event.target.name as 'homeTeamScore' | 'awayTeamScore'
		const value = event.target.value === '' ? undefined : Number(event.target.value)
		dispatch(handleResultado({ partida, handle: { name, value } }))
	}
	const { index, partida, atualizandoPontuacoes } = props
	return isReadOnly || atualizandoPontuacoes ? (
		<ReadOnlyRow
			key={partida._id}
			idx={index}
			partida={partida}
			edit={edit}
			atualizandoPontuacoes={atualizandoPontuacoes}
		/>
	) : (
		<EditableRow
			key={partida._id}
			idx={index}
			partida={partida}
			handleChange={handleChange}
			update={update}
			cancel={cancel}
		/>
	)
}

export default partidaForm
