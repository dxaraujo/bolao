import { useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks';

import { toast } from "react-toastify";
import { Col, Card, CardHeader, CardBody, CardFooter, Form, FormGroup, Input, InputGroup, InputGroupText, Button, Label } from 'reactstrap'
import MaskedInput from 'react-maskedinput'

import { rootUser } from '../../app/config/config'
import { selectPartida, updatePartidaAsync, handle, reset } from './partidaSlice'
import { selectAuthUser } from '../../app/auth/authSlice';
import { getTimesAsync, selectTimes } from '../time/timeSlice';
import moment from 'moment';

const userForm = () => {

    const dispatch = useAppDispatch()
    const history = useHistory()
    const authUser = useAppSelector(selectAuthUser)
    const partida = useAppSelector(selectPartida)
    const times = useAppSelector(selectTimes)

    useEffect(() => {
		dispatch(getTimesAsync())
	}, [])

	const handleSubmit = (event: any) => {
		event.preventDefault()
        dispatch(updatePartidaAsync({ partida: partida!, callback: () => {
            toast.success('Usuário atualizado com sucesso');
        }}))
	}

    const handleChange = (event: any) => {
		event.preventDefault()
        const name = event.target.name
        let value = event.target.value
        if (name === 'timeA' || name === 'timeB') {
            value = times?.find(time => time.nome === value)
        }
        if (name === 'data') {
            value = moment(value, 'DD/MM/YYYY HH:mm:ss').toDate()
        }
        dispatch(handle({ name, value }))
	}

	const back = () => {
        dispatch(reset())
		history.goBack()
	}

    return (
        <Card>
            <CardHeader>Cadastro de Partidas</CardHeader>
            <CardBody>
                <Form className='form-horizontal' onSubmit={handleSubmit}>
                    <FormGroup row>
                        <Col xs='12' md='2'>
                            <Label>Ordem</Label>
                        </Col>
                        <Col xs='12' md='10'>
                            <InputGroup className='input-prepend'>
                                <InputGroupText>@</InputGroupText>
                                <Input id='order' name='order' type='text' className='form-control' value={partida && partida.order} onChange={handleChange} disabled={rootUser !== authUser?.email} />
                            </InputGroup>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col xs='12' md='2'>
                            <Label>Fase</Label>
                        </Col>
                        <Col xs='12' md='10'>
                            <InputGroup className='input-prepend'>
                                <InputGroupText>@</InputGroupText>
                                <Input id='fase' name='fase' type='select' value={partida && partida.fase} onChange={handleChange} disabled={rootUser !== authUser?.email}>
                                    <option value="">Selecione uma Fase</option>
                                    <option value="FASE DE GRUPOS">FASE DE GRUPOS</option>
                                    <option value="OITAVAS DE FINAL">OITAVAS DE FINAL</option>
                                    <option value="QUARTAS DE FINAL">QUARTAS DE FINAL</option>
                                    <option value="SEMIFINAL">SEMIFINAL</option>
                                    <option value="DISPUTA DO 3º LUGAR">DISPUTA DO 3º LUGAR</option>
                                    <option value="FINAL">FINAL</option>
                                </Input>
                            </InputGroup>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col xs='12' md='2'>
                            <Label>Grupo</Label>
                        </Col>
                        <Col xs='12' md='10'>
                            <InputGroup className='input-prepend'>
                                <InputGroupText>@</InputGroupText>
                                <Input id='grupo' name='grupo' type='select' value={partida && partida.grupo} onChange={handleChange} disabled={rootUser !== authUser?.email}>
                                    <option value="">Selecione um Grupo</option>
                                    <option value="SEM GRUPO">SEM GRUPO</option>
                                    <option value="GRUPO A">GRUPO A</option>
                                    <option value="GRUPO B">GRUPO B</option>
                                    <option value="GRUPO C">GRUPO C</option>
                                    <option value="GRUPO D">GRUPO D</option>
                                    <option value="GRUPO E">GRUPO E</option>
                                    <option value="GRUPO F">GRUPO F</option>
                                    <option value="GRUPO G">GRUPO G</option>
                                    <option value="GRUPO H">GRUPO H</option>
                                </Input>
                            </InputGroup>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col xs='12' md='2'>
                            <Label>Rodada</Label>
                        </Col>
                        <Col xs='12' md='10'>
                            <InputGroup className='input-prepend'>
                                <InputGroupText>@</InputGroupText>
                                <Input id='rodada' name='rodada' type='select' value={partida && partida.rodada} onChange={handleChange} disabled={rootUser !== authUser?.email}>
                                    <option value="">Selecione uma Rodada</option>
                                    <option value="SEM RODADA">SEM RODADA</option>
                                    <option value="1ª RODADA">1ª RODADA</option>
                                    <option value="2ª RODADA">2ª RODADA</option>
                                    <option value="3ª RODADA">3ª RODADA</option>
                                </Input>
                            </InputGroup>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col xs='12' md='2'>
                            <Label>Data</Label>
                        </Col>
                        <Col xs='12' md='10'>
                            <InputGroup className='input-prepend'>
                                <InputGroupText>@</InputGroupText>
                                <MaskedInput mask='11/11/1111 11:11:11' id='data' name='data' type='text' className='form-control' value={partida && (partida.data ? moment(partida.data).add(3, 'hours').format('DD/MM/YYYY HH:mm:ss') : '')} onChange={handleChange} disabled={rootUser !== authUser?.email} />
                            </InputGroup>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col xs='12' md='2'>
                            <Label>Time A</Label>
                        </Col>
                        <Col xs='12' md='10'>
                            <InputGroup className='input-prepend'>
                                <InputGroupText>@</InputGroupText>
                                <Input id='timeA' name='timeA' type='select' value={partida && (partida.timeA ? partida.timeA.nome : '')} onChange={handleChange}>
                                    <option value=''>Selecione um Time</option>
                                    {times && times.map((time, idx) => (
                                        <option key={idx} value={time.nome}>{time.nome}</option>
                                    ))}
                                </Input>
                            </InputGroup>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col xs='12' md='2'>
                            <Label>Time B</Label>
                        </Col>
                        <Col xs='12' md='10'>
                            <InputGroup className='input-prepend'>
                                <InputGroupText>@</InputGroupText>
                                <Input id='timeB' name='timeB' type='select' defaultValue={partida && (partida.timeB ? partida.timeB.nome : '')} onChange={handleChange}>
                                    <option value=''>Selecione um Time</option>
                                    {times && times.map((time, idx) => (
                                        <option key={idx} value={time.nome}>{time.nome}</option>
                                    ))}
                                </Input>
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

export default userForm