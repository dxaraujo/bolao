import { ChangeEvent, FormEvent, useEffect } from 'react'
import { MatchStage, MatchStatus } from '@bolao/shared'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
	Col,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Form,
	FormGroup,
	Input,
	InputGroup,
	InputGroupText,
	Button,
	Label,
} from 'reactstrap'
import MaskedInput from 'react-maskedinput'
import { format, parse } from 'date-fns'

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { rootUser } from '../../app/config/config'
import { selectPartida, updatePartidaAsync, handle, reset, HandleChangeType } from './partidaSlice'
import { selectAuthUser } from '../../app/auth/authSlice'
import { getTimesAsync, selectTimes } from '../time/timeSlice'

const PartidaForm = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const authUser = useAppSelector(selectAuthUser)
	const partida = useAppSelector(selectPartida)
	const times = useAppSelector(selectTimes)

	useEffect(() => {
		dispatch(getTimesAsync())
	}, [dispatch])

	const handleSubmit = (event: FormEvent | React.MouseEvent) => {
		event.preventDefault()
		if (!partida) return
		dispatch(
			updatePartidaAsync({
				partida,
				callback: () => toast.success('Partida atualizada com sucesso'),
			}),
		)
	}

	const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		event.preventDefault()
		const name = event.target.name as HandleChangeType['name']
		let value: unknown = event.target.value
		if (name === 'homeTeam' || name === 'awayTeam') {
			value = times?.find((time) => time.name === value)
		}
		if (name === 'utcDate') {
			value = parse(value as string, 'dd/MM/yyyy HH:mm:ss', new Date())
		}
		if (name === 'id' || name === 'matchday' || name === 'homeTeamScore' || name === 'awayTeamScore') {
			value = value === '' ? undefined : Number(value)
		}
		dispatch(handle({ name, value }))
	}

	const back = () => {
		dispatch(reset())
		navigate(-1)
	}

	const disabled = rootUser !== authUser?.email

	return (
		<Card>
			<CardHeader>Cadastro de Partidas</CardHeader>
			<CardBody>
				<Form className='form-horizontal' onSubmit={handleSubmit}>
					<FormGroup row>
						<Col xs='12' md='2'>
							<Label>ID (Football Data)</Label>
						</Col>
						<Col xs='12' md='10'>
							<Input
								id='id'
								name='id'
								type='number'
								value={partida?.id ?? ''}
								onChange={handleChange}
								disabled={disabled}
							/>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Col xs='12' md='2'>
							<Label>Stage</Label>
						</Col>
						<Col xs='12' md='10'>
							<Input id='stage' name='stage' type='select' value={partida?.stage ?? ''} onChange={handleChange} disabled={disabled}>
								{Object.values(MatchStage).map((stage) => (
									<option key={stage} value={stage}>
										{stage}
									</option>
								))}
							</Input>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Col xs='12' md='2'>
							<Label>Status</Label>
						</Col>
						<Col xs='12' md='10'>
							<Input id='status' name='status' type='select' value={partida?.status ?? ''} onChange={handleChange} disabled={disabled}>
								{Object.values(MatchStatus).map((status) => (
									<option key={status} value={status}>
										{status}
									</option>
								))}
							</Input>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Col xs='12' md='2'>
							<Label>Grupo</Label>
						</Col>
						<Col xs='12' md='10'>
							<Input id='group' name='group' type='text' value={partida?.group ?? ''} onChange={handleChange} disabled={disabled} />
						</Col>
					</FormGroup>
					<FormGroup row>
						<Col xs='12' md='2'>
							<Label>Rodada</Label>
						</Col>
						<Col xs='12' md='10'>
							<Input
								id='matchday'
								name='matchday'
								type='number'
								value={partida?.matchday ?? ''}
								onChange={handleChange}
								disabled={disabled}
							/>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Col xs='12' md='2'>
							<Label>Data (UTC)</Label>
						</Col>
						<Col xs='12' md='10'>
							<InputGroup className='input-prepend'>
								<InputGroupText>@</InputGroupText>
								<MaskedInput
									mask='11/11/1111 11:11:11'
									id='utcDate'
									name='utcDate'
									type='text'
									className='form-control'
									value={
										partida?.utcDate
											? format(new Date(partida.utcDate), 'dd/MM/yyyy HH:mm:ss')
											: ''
									}
									onChange={handleChange}
									disabled={disabled}
								/>
							</InputGroup>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Col xs='12' md='2'>
							<Label>Time A</Label>
						</Col>
						<Col xs='12' md='10'>
							<Input
								id='homeTeam'
								name='homeTeam'
								type='select'
								value={partida?.homeTeam?.name ?? ''}
								onChange={handleChange}
							>
								<option value=''>Selecione um Time</option>
								{times?.map((time, idx) => (
									<option key={idx} value={time.name}>
										{time.name}
									</option>
								))}
							</Input>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Col xs='12' md='2'>
							<Label>Time B</Label>
						</Col>
						<Col xs='12' md='10'>
							<Input
								id='awayTeam'
								name='awayTeam'
								type='select'
								value={partida?.awayTeam?.name ?? ''}
								onChange={handleChange}
							>
								<option value=''>Selecione um Time</option>
								{times?.map((time, idx) => (
									<option key={idx} value={time.name}>
										{time.name}
									</option>
								))}
							</Input>
						</Col>
					</FormGroup>
				</Form>
			</CardBody>
			<CardFooter className='app-card-footer'>
				<Button color='primary' size='sm' onClick={handleSubmit}>
					<i className='fas fa-save'></i> Salvar
				</Button>
				<Button color='secundary' size='sm' onClick={back}>
					<i className='fas fa-undo'></i> Voltar
				</Button>
			</CardFooter>
		</Card>
	)
}

export default PartidaForm
