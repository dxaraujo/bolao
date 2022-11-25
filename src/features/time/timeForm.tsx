import { useHistory } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks';

import { toast } from "react-toastify";
import { Col, Card, CardHeader, CardBody, CardFooter, Form, FormGroup, Input, InputGroup, InputGroupText, Button, Label } from 'reactstrap'

import { selectTime, handle, reset, createTimeAsync, updateTimeAsync } from './timeSlice'

const timeForm = () => {

    const dispatch = useAppDispatch()
    const history = useHistory()
    const time = useAppSelector(selectTime)

	const handleSubmit = (event: any) => {
		event.preventDefault()
		if (time!._id) {
			dispatch(updateTimeAsync({ time: time!, callback: () => {
                toast.success('Time atualizado com sucesso');
            }}))
		} else {
			dispatch(createTimeAsync({ time: time!, callback: () => {
			    toast.success('Time inserido com sucesso');
            }}))
		}
	}

    const handleChange = (event: any) => {
		event.preventDefault()
        const name = event.target.name
        const value = event.target.value
        dispatch(handle({ name, value }))
	}

	const back = () => {
        dispatch(reset())
		history.goBack()
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
                                <Input name='nome' type='text' value={time ? time.nome : undefined} onChange={handleChange} placeholder='Nome do Time, Ex: Brasil' />
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
                                <Input name='sigla' type='text' value={time ? time.sigla : undefined} onChange={handleChange} placeholder='Sigla do Time. Ex: BRA' />
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
                                <Input name='bandeira' type='text' value={time ? time.bandeira : undefined} onChange={handleChange} placeholder='Bandeira do time, Ex: br' />
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
        </Card >
    )
}

export default timeForm