import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { Card, CardHeader, CardBody, Table, Alert } from 'reactstrap'

import ResultadoForm from './resultadoForm'
import { getResultadosAsync, selectPartidas } from './partidaSlice'
import { getConfigsAsync, selectAtualizandoPontuacoes } from '../../app/config/configSlice';

const resultado = () => {

    const dispatch = useAppDispatch()
	const partidas = useAppSelector(selectPartidas)
    const atualizandoPontuacoes = useAppSelector(selectAtualizandoPontuacoes)

    useEffect(() => {
		dispatch(getResultadosAsync())
        dispatch(getConfigsAsync())
	}, [])

    let resultadoIndex = partidas && partidas.length
    return (
        <>
            {atualizandoPontuacoes && (<Alert color='warning' className='alert-sem-margin-bottom'>Atenção, atualização de resultados em andamento!</Alert>)}
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
                            {partidas && [...partidas].sort((partidaA, partidaB) => partidaB.order! - partidaA.order!).map(partida => (
                                <ResultadoForm key={partida._id} index={--resultadoIndex} partida={partida} atualizandoPontuacoes={atualizandoPontuacoes} />
                            ))}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        </>
    )
}

export default resultado