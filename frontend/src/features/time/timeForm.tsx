import { ChangeEvent, FormEvent } from 'react'
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

import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectTime, handle, reset, createTimeAsync, updateTimeAsync } from './timeSlice'

const TimeForm = () => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const time = useAppSelector(selectTime)

	const handleSubmit = (event: FormEvent | React.MouseEvent) => {
		event.preventDefault()
		if (!time) return
		if (time._id) {
			dispatch(
				updateTimeAsync({
					time,
					callback: () => toast.success('Time atualizado com sucesso'),
				}),
			)
		} else {
			dispatch(
				createTimeAsync({
					time,
					callback: () => toast.success('Time inserido com sucesso'),
				}),
			)
		}
	}

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		event.preventDefault()
		const { name, value } = event.target
		const parsed = name === 'id' ? (value === '' ? undefined : Number(value)) : value
		dispatch(handle({ name: name as 'id' | 'name' | 'shortName' | 'tla' | 'crest', value: parsed }))
	}

	const back = () => {
		dispatch(reset())
		navigate(-1)
	}

	return (
		<Card>
			<CardHeader>Cadastro de Times</CardHeader>
			<CardBody>
				<Form className='form-horizontal' onSubmit={handleSubmit}>
					<FormGroup row>
						<Col xs='12' md='2'>
							<Label>ID (Football Data)</Label>
						</Col>
						<Col xs='12' md='10'>
							<InputGroup className='input-prepend'>
								<InputGroupText>@</InputGroupText>
								<Input
									name='id'
									type='number'
									value={time?.id ?? ''}
									onChange={handleChange}
									placeholder='Ex: 758'
									disabled={!!time?._id}
								/>
							</InputGroup>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Col xs='12' md='2'>
							<Label>Nome</Label>
						</Col>
						<Col xs='12' md='10'>
							<InputGroup className='input-prepend'>
								<InputGroupText>@</InputGroupText>
								<Input
									name='name'
									type='text'
									value={time?.name ?? ''}
									onChange={handleChange}
									placeholder='Nome do Time, Ex: Brasil'
								/>
							</InputGroup>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Col xs='12' md='2'>
							<Label>Nome curto</Label>
						</Col>
						<Col xs='12' md='10'>
							<InputGroup className='input-prepend'>
								<InputGroupText>@</InputGroupText>
								<Input
									name='shortName'
									type='text'
									value={time?.shortName ?? ''}
									onChange={handleChange}
									placeholder='Ex: Brazil'
								/>
							</InputGroup>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Col xs='12' md='2'>
							<Label>Sigla (TLA)</Label>
						</Col>
						<Col xs='12' md='10'>
							<InputGroup className='input-prepend'>
								<InputGroupText>@</InputGroupText>
								<Input
									name='tla'
									type='text'
									value={time?.tla ?? ''}
									onChange={handleChange}
									placeholder='Sigla do Time. Ex: BRA'
								/>
							</InputGroup>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Col xs='12' md='2'>
							<Label>Escudo (URL)</Label>
						</Col>
						<Col xs='12' md='10'>
							<InputGroup className='input-prepend'>
								<InputGroupText>@</InputGroupText>
								<Input
									name='crest'
									type='text'
									value={time?.crest ?? ''}
									onChange={handleChange}
									placeholder='URL do escudo'
								/>
							</InputGroup>
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

export default TimeForm
