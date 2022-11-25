import { useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { Card, CardHeader, CardBody, Table, ButtonGroup, Button } from 'reactstrap'
import { toast } from "react-toastify";
import Swal from 'sweetalert2'

import If from '../../app/components/if';
import { rootUser } from '../../app/config/config'
import { getUsersAsync, deleteUserAsync, selectUsers, select, UserType } from './userSlice'
import { selectAuthUser } from '../../app/auth/authSlice';

const users = () => {

    const dispatch = useAppDispatch()
    const history = useHistory()
	const authUser = useAppSelector(selectAuthUser)!
	const users = useAppSelector(selectUsers)

    useEffect(() => {
		dispatch(getUsersAsync())
	}, [])

	const prepareUpdate = (user: UserType) => {
		dispatch(select(user))
		history.push('/user/update')
	}

    const prepareDelete = (user: UserType) => {
		Swal.fire({
			title: 'Você tem certeza?',
			text: 'Depois de deletado, você não poderá recupear os dados!',
			icon: 'warning',
			showConfirmButton: true,
			showCancelButton: true
		}).then((result) => {
			if (result.isConfirmed) {
				dispatch(deleteUserAsync({ user, callback: () => {
                    toast.success('Usuário apagado com sucesso!');
                }}))
			} else {
				Swal.fire('A operação foi cancelada!', '', 'error');
			}
		});
	}

    return (
        <Card>
            <CardHeader>
                Lista de Usuários
            </CardHeader>
            <CardBody style={{ padding: '0px' }}>
                <Table responsive striped borderless>
                    <thead>
                        <tr className='gridUsers'>
                            <th className='text-center'>#</th>
                            <th></th>
                            <th>Nome / e-mail</th>
                            <th className='text-center'>Ativo</th>
                            <th className='text-center'></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users && users.map((user: UserType, index: number) => {
                            return (
                                <tr key={index} className='gridUsers'>
                                    <td className='text-center'>{index + 1}</td>
                                    <td><img alt='avatar' src={user.picture} className='img-avatar' width={50} height={50} /></td>
                                    <td>{user.name}<br/>{user.email}</td>
                                    <td className='text-center'><i className={`fas fa-check text-${user.ativo ? 'success' : 'secondary'}`}></i></td>
                                    <td className='text-center'>
                                        <ButtonGroup>
                                            <Button className='text-white' size='sm' color='warning' onClick={() => prepareUpdate(user)}>
                                                <i className='fas fa-edit'></i>
                                            </Button>
                                            <If test={rootUser === authUser.email}>
                                                <Button size='sm' color='danger' onClick={() => prepareDelete(user)}>
                                                    <i className='fas fa-trash-alt'></i>
                                                </Button>
                                            </If>
                                        </ButtonGroup>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </CardBody>
        </Card>
    )
}

export default users