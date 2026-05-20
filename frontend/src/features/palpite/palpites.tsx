import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { Card, CardHeader, CardBody, Table, Input } from 'reactstrap'
import { getUsersAsync, selectUsers } from '../user/userSlice';
import { getPartidasAsync, PartidaType, selectPartidas } from '../partida/partidaSlice';
import { FaseType, getFasesAsync, selectFases } from '../fase/faseSlice';

const filtrarPartidas = (fases?: FaseType[], partidas?: PartidaType[], partidaId?: string): PartidaType[] => {
    return partidas && partidas.filter(partida => {
        let estaDisponivelParaConsulta = false
        if (fases) {
            for (let i = 0; i < fases.length; i++) {
                const fase = fases[i];
                if (partida.fase === fase.nome) {
                    const testPartidaId = partidaId ? (partidaId === 'TODAS' || partida._id === partidaId) : true
                    estaDisponivelParaConsulta = fase.status === 'B' && testPartidaId
                }
            }
        }
        return estaDisponivelParaConsulta
    }) || []
}

const encontrarUltimaClassificacao = (partidas: PartidaType[]): string | undefined => {
    let ultimaClassificacao: string | undefined = undefined
    partidas.forEach(partida => {
        if (partida.placarTimeA !== undefined && partida.placarTimeA >= 0 && partida.placarTimeB !== undefined && partida.placarTimeB >= 0) {
            ultimaClassificacao = partida._id
        }
    });
    return ultimaClassificacao
}

const palpites = () => {

    const dispatch = useAppDispatch()
    const fases = useAppSelector(selectFases)
	const partidas = useAppSelector(selectPartidas)
	const users = useAppSelector(selectUsers)

    const [partidaId, setPartidaId] = useState('TODAS')

    useEffect(() => {
        dispatch(getFasesAsync())
        dispatch(getPartidasAsync())
		dispatch(getUsersAsync())
	}, [])

    useEffect(() => {
        const partidasFiltered = filtrarPartidas(fases, partidas)
        const ultimaPartida = encontrarUltimaClassificacao(partidasFiltered!)
        setPartidaId(ultimaPartida ? ultimaPartida : 'TODAS')
	}, [fases, partidas])

	const handleChange = (event:any) => {
        setPartidaId(event.target.value)
	}

    return (
        <Card>
            <CardHeader className='d-flex align-items-center justify-content-between'>
                <span>Visualizar palpites</span>
                <div>
                    <Input id='partidaId' type='select' value={partidaId || 'TODAS'} onChange={handleChange}>
                        <option value={'TODAS'}>Todas as partidas</option>
                        {filtrarPartidas(fases, partidas).map(partida => (
                            <option key={partida._id} value={partida._id}>{`${partida.timeA?.nome} x ${partida.timeB?.nome}`}</option>
                        ))}
                    </Input>
                </div>
            </CardHeader>
            <CardBody style={{ padding: '0px' }}>
                {filtrarPartidas(fases, partidas, partidaId).map(partida => (
                    <Card key={partida._id} style={{ marginBottom: '0px' }}>
                        <CardHeader>{`${partida.timeA?.nome} ${partida.placarTimeA !== undefined ? partida.placarTimeA : ''} x ${partida.placarTimeB !== undefined ? partida.placarTimeB : ''} ${partida.timeB?.nome}`}</CardHeader>
                        <CardBody style={{ padding: '0px' }}>
                            <Table responsive striped borderless>
                                <thead>
                                    <tr className='gridPalpites'>
                                        <th className='text-center'>#</th>
                                        <th>Nome</th>
                                        <th className='text-center'>Palpite</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users && [...users].sort((u1, u2) => u1.classificacao! - u2.classificacao!).map((user, idx) => (
                                        <tr key={idx} className='gridPalpites'>
                                            <td className='text-center'>{idx + 1}</td>
                                            <td>{user.name}</td>
                                            <td className='text-center' style={{ justifySelf: 'center' }}>
                                                <div key={idx} className='rodadaPalpites'>
                                                    <div className='bandeiraTimeA'>
                                                        <i className={`bandeiraTimeA flag-icon flag-icon-${partida.timeA?.bandeira}`} />
                                                    </div>
                                                    <div className='palpiteTimeA'>
                                                        {user.palpites && user.palpites[partida.order! - 1] ? user.palpites[partida.order! - 1].placarTimeA : ''}
                                                    </div>
                                                    <div className='divisorPalpite'>x</div>
                                                    <div className='palpiteTimeB'>
                                                        {user.palpites && user.palpites[partida.order! - 1] ? user.palpites[partida.order! - 1].placarTimeB : ''}
                                                    </div>
                                                    <div className='bandeiraTimeB'>
                                                        <i className={`bandeiraTimeB flag-icon flag-icon-${partida.timeB?.bandeira}`} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </CardBody>
                    </Card>
                ))}
            </CardBody>
        </Card>
    )
}

export default palpites