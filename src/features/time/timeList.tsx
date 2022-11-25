import { useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { Card, CardHeader, CardBody, Table, ButtonGroup, Button } from 'reactstrap'
import { toast } from "react-toastify";
import Swal from 'sweetalert2'

import If from '../../app/components/if';
import { rootUser } from '../../app/config/config'
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { TimeType, selectTimes, select, create, getTimesAsync, deleteTimeAsync } from './timeSlice'
import { selectAuthUser } from '../../app/auth/authSlice'

const timeList = () => {

    const dispatch = useAppDispatch()
    const history = useHistory()
    const user = useAppSelector(selectAuthUser)
    const times = useAppSelector(selectTimes)

    useEffect(() => {
        dispatch(getTimesAsync())
    }, [])

	const add = () => {
        dispatch(create())
		history.push('/time/create')
	}

	const update = (time: TimeType) => {
		dispatch(select(time))
		history.push('/time/update')
	}

	const prepareDelete = (time: TimeType) => {
		Swal.fire({
			title: 'Você tem certeza?',
			text: 'Depois de deletado, você não poderá recupear os dados!',
			icon: 'warning',
			showConfirmButton: true,
			showCancelButton: true
		}).then((result) => {
			if (result.isConfirmed) {
				dispatch(deleteTimeAsync({ time, callback: () => {
                    toast.success('Time apagado com sucesso!');
                }}))
			} else {
				Swal.fire('A operação foi cancelada!', '', 'error');
			}
		});
	}

    return (
        <Card>
            <CardHeader>
                Lista de Times
                <If test={user !== undefined && (rootUser === user.email)}>
                    <Button color='success' size='sm' className='float-right mb-0' onClick={add}>
                        <i className='fas fa-plus-circle'></i> Adicionar
                    </Button>
                </If>
            </CardHeader>
            <CardBody style={{ padding: '0px' }}>
                <Table responsive striped borderless>
                    <thead>
                        <tr className='gridTime'>
                            <th className='text-center'>#</th>
                            <th>Nome</th>
                            <th className='text-center'>Sigla</th>
                            <th className='text-center'><i className="fas fa-flag text-secondary"></i></th>
                            <th className='text-center'></th>
                        </tr>
                    </thead>
                    <tbody>
                        {times && times.map((time, idx) => {
                            return (
                                <tr key={idx} className='gridTime'>
                                    <td className='text-center'>{idx + 1}</td>
                                    <td>{time.nome}</td>
                                    <td className='text-center'>{time.sigla}</td>
                                    <td className='text-center'><i className={`flag-icon flag-icon-${time.bandeira} h4`} style={{ margin: '0px' }}></i></td>
                                    <td className='text-center'>
                                        <ButtonGroup>
                                            <Button className='text-white' size='sm' color='warning' onClick={() => update(time)}>
                                                <i className='fas fa-edit'></i>
                                            </Button>
                                            <If test={user !== undefined && (rootUser === user.email)}>
                                                <Button size='sm' color='danger' onClick={() => prepareDelete(time)}>
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

export default timeList