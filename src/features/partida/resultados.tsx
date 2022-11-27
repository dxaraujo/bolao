import moment from 'moment';
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { Card, CardHeader, CardBody, Table } from 'reactstrap'

import { getResultadosAsync, selectPartidas } from './partidaSlice'

const resultado = () => {

    const dispatch = useAppDispatch()
    const partidas = useAppSelector(selectPartidas)

    useEffect(() => {
        dispatch(getResultadosAsync())
    }, [])

    let resultadoIndex = partidas && partidas.length
    return (
        <Card>
            <CardHeader>Resultados das Partidas</CardHeader>
            <CardBody style={{ padding: '0px' }}>
                <Table responsive striped borderless>
                    <thead>
                        <tr className='gridResultadosView'>
                            <th className='text-center'>#</th>
                            <th className='text-center'>Partida</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partidas && [...partidas].sort((partidaA, partidaB) => partidaB.order! - partidaA.order!).map(partida => (
                            <tr key={partida._id} className='gridResultados'>
                                <td className='text-center'>{resultadoIndex--}</td>
                                <td className='text-center'>
                                    <div className='rodada'>
                                        <div className='nomeTimeA'>
                                            <span className='h6 nomeTimeA'>{partida.timeA ? partida.timeA.sigla : ''}</span>
                                        </div>
                                        <div className='bandeiraTimeA'>
                                            <i className={`bandeiraTimeA flag-icon flag-icon-${partida.timeA ? partida.timeA.bandeira : 'xx'}`} />
                                        </div>
                                        <div className='palpiteTimeA'>
                                            {partida.placarTimeA}
                                        </div>
                                        <div className='divisorPalpite'>x</div>
                                        <div className='palpiteTimeB'>
                                            {partida.placarTimeB}
                                        </div>
                                        <div className='bandeiraTimeB'>
                                            <i className={`bandeiraTimeB flag-icon flag-icon-${partida.timeB ? partida.timeB.bandeira : 'xx'}`} />
                                        </div>
                                        <div className='nomeTimeB'>
                                            <span className='h6 nomeTimeB'>{partida.timeB ? partida.timeB.sigla : ''}</span>
                                        </div>
                                        <div className='horaPartida'>
                                            <span className='horaPartida text-secundary'>{partida.data ? moment(partida.data).add(3, 'hours').format('DD/MM/YYYY HH:mm:ss') : ''}</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </CardBody>
        </Card>
    )
}

export default resultado