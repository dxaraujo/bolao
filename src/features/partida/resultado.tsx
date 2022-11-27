import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { Card, CardHeader, CardBody, Table } from 'reactstrap'

import ResultadoForm from './resultadoForm'
import { getResultadosAsync, selectPartidas } from './partidaSlice'

const resultado = () => {

    const dispatch = useAppDispatch()
	const partidas = useAppSelector(selectPartidas)

    useEffect(() => {
		dispatch(getResultadosAsync())
	}, [])

    return (
        <Card>
            <CardHeader>Resultados das Partidas</CardHeader>
            <CardBody style={{ padding: '0px' }}>
                <Table responsive striped borderless>
                    <thead>
                        <tr className='gridResultados'>
                            <th className='text-center'>#</th>
                            <th className='text-center'>Partida</th>
                            <th className='text-center'></th>
                        </tr>
                    </thead>
                    <tbody>
                        {partidas && [...partidas].sort((partidaA, partidaB) => partidaB.order! - partidaA.order!).map((partida, idx) => (
                            <ResultadoForm key={partida._id} index={idx} partida={partida} />
                        ))}
                    </tbody>
                </Table>
            </CardBody>
        </Card>
    )
}

export default resultado