import { useHistory } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks';

import { toast } from "react-toastify";
import { Col, Card, CardHeader, CardBody, CardFooter, Form, FormGroup, Input, InputGroup, InputGroupText, Button, Label } from 'reactstrap'

import { rootUser } from '../../app/config/config'
import { selectUser, updateUserAsync, handle, reset } from './userSlice'
import { selectAuthUser } from '../../app/auth/authSlice';

const userForm = () => {

    const dispatch = useAppDispatch()
    const history = useHistory()
    const authUser = useAppSelector(selectAuthUser)!
    const user = useAppSelector(selectUser)!

	const handleSubmit = (event: any) => {
		event.preventDefault()
        dispatch(updateUserAsync({ user, callback: () => {
            toast.success('Usuário atualizado com sucesso');
        }}))
	}

    const handleChange = (event: any) => {
		event.preventDefault()
        const name = event.target.name
        const value = event.target.value == 1 ? true : false
        console.log(`name: ${name}, value: ${event.target.value}`)
        dispatch(handle({ name, value }))
	}

	const back = () => {
        dispatch(reset())
		history.goBack()
	}

    return (
        <Card>
            <CardHeader>Cadastro de Usuários</CardHeader>
            <CardBody>
                <Form className='form-horizontal' onSubmit={handleSubmit}>
                    <FormGroup row>
                        <Col xs='12' md='2'>
                            <Label>Nome</Label>
                        </Col>
                        <Col xs='12' md='10'>
                            <InputGroup className='input-prepend'>
                                <InputGroupText>@</InputGroupText>
                                <Input name='name' type='text' value={user && user.name} placeholder='Nome do usuário' disabled />
                            </InputGroup>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col xs='12' md='2'>
                            <Label>E-mail</Label>
                        </Col>
                        <Col xs='12' md='10'>
                            <InputGroup className='input-prepend'>
                                <InputGroupText>@</InputGroupText>
                                <Input name='email' type='text' value={user && user.email} placeholder='E-mail do usuário' disabled />
                            </InputGroup>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col xs='12' md='2'>
                            <Label>Ativo</Label>
                        </Col>
                        <Col xs='12' md='10'>
                            <InputGroup className='input-prepend'>
                                <InputGroupText>@</InputGroupText>
                                <Input name='ativo' type='select' value={user && user.ativo ? 1 : 0} onChange={event => handleChange(event)}>
                                    <option key={1} value={1}>Sim</option>
                                    <option key={0} value={0}>Não</option>
                                </Input>
                            </InputGroup>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col xs='12' md='2'>
                            <Label>Admin</Label>
                        </Col>
                        <Col xs='12' md='10'>
                            <InputGroup className='input-prepend'>
                                <InputGroupText>@</InputGroupText>
                                <Input name='isAdmin' type='select' value={user && user.isAdmin ? 1 : 0} onChange={event => handleChange(event)} disabled={rootUser !== authUser.email}>
                                    <option key={1} value={1}>Sim</option>
                                    <option key={0} value={0}>Não</option>
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