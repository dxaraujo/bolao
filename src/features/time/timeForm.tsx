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
		dispatch(handle({ name, value }))
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
							<Label>Nome</Label>
						</Col>
						<Col xs='12' md='10'>
							<InputGroup className='input-prepend'>
								<InputGroupText>@</InputGroupText>
								<Input
									name='nome'
									type='text'
									value={time ? time.nome : ''}
									onChange={handleChange}
									placeholder='Nome do Time, Ex: Brasil'
								/>
							</InputGroup>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Col xs='12' md='2'>
							<Label>Sigla</Label>
						</Col>
						<Col xs='12' md='10'>
							<InputGroup className='input-prepend'>
								<InputGroupText>@</InputGroupText>
								<Input
									name='sigla'
									type='text'
									value={time ? time.sigla : ''}
									onChange={handleChange}
									placeholder='Sigla do Time. Ex: BRA'
								/>
							</InputGroup>
						</Col>
					</FormGroup>
					<FormGroup row>
						<Col xs='12' md='2'>
							<Label>Bandeira</Label>
						</Col>
						<Col xs='12' md='10'>
							<InputGroup className='input-prepend'>
								<InputGroupText>@</InputGroupText>
								<Input
									name='bandeira'
									type='text'
									value={time ? time.bandeira : ''}
									onChange={handleChange}
									placeholder='Bandeira do time, Ex: br'
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
