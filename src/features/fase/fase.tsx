import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { Card, CardHeader, CardBody, Table } from 'reactstrap'

import FaseForm from './faseForm'
import { FaseType, getFasesAsync, selectFases } from './faseSlice'
import { selectAuthUser } from '../../app/auth/authSlice';

const fase = () => {

    const dispatch = useAppDispatch()
	const user = useAppSelector(selectAuthUser)!
	const fases = useAppSelector(selectFases)

    useEffect(() => {
		dispatch(getFasesAsync())
	}, [])

    return (
        <Card>
            <CardHeader>
                Fases da competição
            </CardHeader>
            <CardBody style={{ padding: '0px' }}>
                <Table responsive striped borderless>
                    <thead>
                        <tr className='gridFases'>
                            <th className='text-center'>#</th>
                            <th>Nome</th>
                            <th className='text-center'>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fases !== undefined &&  fases.map((fase: FaseType, idx: number) => (
                            <FaseForm key={fase._id} index={idx} fase={fase} user={user} />
                        ))}
                    </tbody>
                </Table>
            </CardBody>
        </Card>
    )
}

export default fase