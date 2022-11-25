import { useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { Card, CardHeader, CardBody, Table, ButtonGroup, Button } from 'reactstrap'
import { toast } from "react-toastify";
import Swal from 'sweetalert2'
import moment from 'moment';

import If from '../../app/components/if';
import { rootUser } from '../../app/config/config'
import { getPartidasAsync, deletePartidaAsync, selectPartidas, select, create, PartidaType } from './partidaSlice'
import { selectAuthUser } from '../../app/auth/authSlice';
import { selectFases } from '../fase/faseSlice';

const users = () => {

    const dispatch = useAppDispatch()
    const history = useHistory()
	const authUser = useAppSelector(selectAuthUser)
	const partidas = useAppSelector(selectPartidas)
    const fases = useAppSelector(selectFases)

    useEffect(() => {
		dispatch(getPartidasAsync())
	}, [])

    const add = () => {
		dispatch(create())
		history.push('/partida/create')
	}

	const update = (user: PartidaType) => {
		dispatch(select(user))
		history.push('/partida/update')
	}

    const prepareDelete = (partida: PartidaType) => {
		Swal.fire({
			title: 'Você tem certeza?',
			text: 'Depois de deletado, você não poderá recupear os dados!',
			icon: 'warning',
			showConfirmButton: true,
			showCancelButton: true
		}).then((result) => {
			if (result.isConfirmed) {
				dispatch(deletePartidaAsync({ partida, callback: () => {
                    toast.success('Usuário apagado com sucesso!');
                }}))
			} else {
				Swal.fire('A operação foi cancelada!', '', 'error');
			}
		});
	}

    const desabilitado = (nomeFase: string | undefined) => {
        const fase = fases.find(f => f.nome === nomeFase) || { status: 'D' }
        return fase.status === 'D'
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
                        {partidas && partidas.map((partida, idx) => {
                            return (
                                <tr key={idx} className='gridPartidas'>
                                    <td className='text-center'>{partida.order}</td>
                                    <td>{partida.timeA ? partida.timeA.nome : ''}</td>
                                    <td>{partida.timeB ? partida.timeB.nome : ''}</td>
                                    <th>{partida.data ? moment(partida.data).add(3, 'hours').format('DD/MM/YYYY HH:mm:ss') : ''}</th>
                                    <td className='text-center'>
                                        <If test={desabilitado(partida.fase)}>
                                            <ButtonGroup>
                                                <Button className='text-white' size='sm' color='warning' onClick={() => update(partida)}>
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
                            )
                        })}
                    </tbody>
                </Table>
            </CardBody>
        </Card>
    )
}

export default users