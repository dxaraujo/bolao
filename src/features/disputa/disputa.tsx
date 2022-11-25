import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { Card, CardHeader, CardBody, Table, Row, Input } from 'reactstrap'
import { ChartData, ChartOptions, Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2'

import If from '../../app/components/if';
import { selectAuthUser } from '../../app/auth/authSlice';
import { getPartidasAsync, selectPartidas } from '../partida/partidaSlice';
import { getUsersAsync, select, selectUser, selectUsers, UserType } from '../user/userSlice';

import blankavatar from '../../assets/img/blankavatar.svg'
import duck from '../../assets/img/duck.svg'

const colors = [
	'rgb(54, 162, 235)',
    'rgb(75, 192, 192)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(255, 99, 132)',
]

const chartClassificacaoData: ChartData<'line'> = {
	labels: [],
	datasets: []
}

const chartLineOpts: ChartOptions<'line'> = {
    maintainAspectRatio: false,
    scales: {
        x: {
            grid: {
                display: false,
            }
        },
        y: {
            min: 1,
            reverse : true,
            ticks: {
                stepSize: 1
            }
        }
    }
}

const disputa = () => {

    Chart.register(...registerables)

    const dispatch = useAppDispatch()
    const authUser = useAppSelector(selectAuthUser)
    const partidas = useAppSelector(selectPartidas)
	const users = useAppSelector(selectUsers)
    const user = useAppSelector(selectUser)

    const [authenticatedUser, setAuthenticatedUser] = useState<UserType>({})

    useEffect(() => {
        dispatch(getPartidasAsync())
		dispatch(getUsersAsync())
	}, [])

    useEffect(() => {
        if (users.length > 0) {
            setAuthenticatedUser(users.find(user => user._id === authUser?._id) || {})
        }
	}, [users])

    const handleChange = (event: any) => {
        if (event.target.value !== undefined) {
            const user = users.find(u => u._id === event.target.value)
            if (user !== undefined) {
                dispatch(select(user))
            }
        }
    }

    const encontrarUltimaPartida = (): number => {
		let ultimaPartida = 0
		partidas.forEach(partida => {
			if (partida.placarTimeA !== undefined && partida.placarTimeA >= 0 && partida.placarTimeB !== undefined && partida.placarTimeB >= 0) {
				ultimaPartida = partida.order!
			}
		});
		return ultimaPartida
	}

    const ordenarUsuarios = (users: UserType[]) => {
        return [...users].sort((u1, u2) =>   {
            const test0 = u2.totalAcumulado! - u1.totalAcumulado!
            if (test0 === 0) {
                const test1 = u2.placarCheio! - u1.placarCheio!
                if (test1 === 0) {
                    const test2 = u2.placarTimeVencedorComGol! - u1.placarTimeVencedorComGol!
                    if (test2 === 0) {
                        const test3 = u2.placarTimeVencedor! - u1.placarTimeVencedor!
                        if (test3 === 0 ) {
                            return u2.placarGol! - u1.placarGol!
                        }
                        return test3
                    }
                    return test2
                }
                return test1
            }
            return test0
        })
    }

    const montarGraficoClassificacaoGeral = () => {
		chartClassificacaoData.labels = []
		chartClassificacaoData.datasets = []
		const ultimaPartida = encontrarUltimaPartida()
		const chartUsers = [authenticatedUser, user]
		for (let i = 0; i < chartUsers.length; i++) {
			const user = chartUsers[i]
			let data: number[] = []
			if (user) {
				chartClassificacaoData.datasets.push({
					data,
					label: user.name,
					fill: false,
					backgroundColor: colors[i],
					borderColor: colors[i],
					borderWidth: 2,
					pointBorderColor: colors[i],
					pointBackgroundColor: colors[i],
					pointBorderWidth: 2,
					pointHoverBackgroundColor: colors[i],
					pointHoverBorderColor: colors[i],
					pointHoverBorderWidth: 2,
					pointRadius: 2,
				})
				if (user.palpites) {
					let palpites = user.palpites.filter(palpite => palpite.partida!.order! <= ultimaPartida)
					palpites = palpites.slice(Math.max(palpites.length - 10, 0))
					for (let j = 0; j < palpites.length; j++) {
						if (i === 0) {
							chartClassificacaoData.labels.push(`${palpites[j].partida!.timeA!.sigla} x ${palpites[j].partida!.timeB!.sigla}`)
						}
						data.push(palpites[j].classificacao!)
					}
				}
			}
		}
		return chartClassificacaoData
	}

    const ultimaClassificacao = users.reduce((ult, user) => user.classificacao && (user.classificacao > ult) ? user.classificacao : ult, 0)
    return (
        <div style={{ backgroundColor: 'white' }}>
            <Card style={{ marginBottom: '0px' }}>
                <CardHeader className='d-flex align-items-center justify-content-between'>
                    <span>Disputar com:</span>
                    <div>
                        <Input id='usuario' name='usuario' type='select' value={user ? user._id : undefined} onChange={handleChange}>
                            <option value={undefined}>Selecione um participante</option>
                            {ordenarUsuarios(users).filter(u => u._id !== authenticatedUser._id).map(u => (
                                <option key={u._id} value={u._id}>{u.name}</option>
                            ))}
                        </Input>
                    </div>
                </CardHeader>
                <CardBody style={{ padding: '0px' }}>
                    <If test={user !== undefined && user.palpites !== undefined}>
                        <>
                            <Row>
                                <div className='col-sx-12 col-sm-12 col-md-12 col-lg-12 col-xl-12'>
                                    <Card>
                                        <CardBody>
                                            <div style={{ borderRadius: '8px', overflow: 'hidden', backgroundImage: 'linear-gradient(to right,  rgba(224,224,224,1) 0%,rgba(255,255,255,1) 50%,rgba(224,224,224,1) 100%)'}}>
                                                <Table responsive borderless>
                                                    <tbody>
                                                        <tr>
                                                            <td style={{verticalAlign: 'middle', textAlign: 'center', width: '100px'}}><img alt='avatar' src={authenticatedUser?.picture} className='img-avatar' width={75} height={75} /></td>
                                                            <td className='d-flex justify-content-center'>
                                                                <table style={{width: '100%', padding: '10px'}}>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td colSpan={5} className='text-center text-muted' style={{padding: '0px', fontSize: '12px', fontStyle: 'italic'}}>Classificação</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td className='text-center' style={{width: '22px', padding: '2px'}}>
                                                                                <If test={authenticatedUser?.classificacao !== undefined && (authenticatedUser?.classificacao > 0 && authenticatedUser.classificacao < 4)}>
                                                                                    <i className={`fas fa-trophy ${authenticatedUser?.classificacao === 1 ? 'goldTrophy' : authenticatedUser?.classificacao === 2 ? 'silverTrophy' : 'bronzeTrophy'}`}></i>
                                                                                </If>
                                                                                <If test={authenticatedUser?.classificacao !== undefined && (authenticatedUser?.classificacao > 3 && authenticatedUser?.classificacao === ultimaClassificacao)}>
                                                                                    <img src={duck} alt='duck' width={16} height={16} />
                                                                                </If>
                                                                            </td>
                                                                            <td className='text-right placarClassificacao' style={{padding: '2px'}}>{authenticatedUser?.classificacao}</td>
                                                                            <td style={{width: '50px'}}></td>
                                                                            <td className='text-left placarClassificacao' style={{padding: '2px'}}>{user ? user.classificacao: 0}</td>
                                                                            <td className='text-center' style={{width: '22px', padding: '2px'}}>
                                                                                <If test={user && user.classificacao !== undefined && user.classificacao > 0 && user.classificacao < 4}>
                                                                                    <i className={`fas fa-trophy ${user ? (user.classificacao === 1 ? 'goldTrophy' : user.classificacao === 2 ? 'silverTrophy' : 'bronzeTrophy') : ''}`}></i>
                                                                                </If>
                                                                                <If test={user && user.classificacao !== undefined && user.classificacao > 3 && user.classificacao === ultimaClassificacao}>
                                                                                    <img src={duck} alt='duck' width={16} height={16} />
                                                                                </If>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td style={{width: '22px'}}></td>
                                                                            <td className='text-right placarClassificacao' style={{padding: '2px'}}>{authenticatedUser?.totalAcumulado}</td>
                                                                            <td style={{width: '50px'}}></td>
                                                                            <td className='text-left placarClassificacao' style={{padding: '2px'}}>{user ? user.totalAcumulado: 0}</td>
                                                                            <td style={{width: '22px'}}></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td colSpan={5} className='text-center text-muted' style={{padding: '0px', fontSize: '12px', fontStyle: 'italic'}}>Pontuação</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                            <td style={{verticalAlign: 'middle', textAlign: 'center', width: '100px'}}><img alt='avatar' src={user ? user.picture : blankavatar} className='img-avatar' width={75} height={75} /></td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            </div>	
                                        </CardBody>
                                    </Card>
                                </div>
                            </Row>
                            <Row>
                                <div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
                                    <Card>
                                        <CardBody>
                                            <div className='col-sm-12 mb-3'>
                                                <h5 className='mb-0 card-title'>Pontuação</h5>
                                                <div className='small'>Estatísticas gerais</div>
                                            </div>
                                            <div style={{ display: 'grid', alignItems: 'center', height: '310px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)'}}>
                                                <Table responsive striped borderless>
                                                    <thead>
                                                        <tr>
                                                            <th className='text-center'></th>
                                                            <th className='text-right' style={{ verticalAlign: 'middle' }}>Pontuação por tipo</th>
                                                            <th className='text-center'><img alt='avatar' src={authenticatedUser?.picture} className='img-avatar' width={35} height={35} /></th>
                                                            <th className='text-center'><img alt='avatar' src={user ? user.picture : blankavatar} className='img-avatar' width={35} height={35} /></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td className='d-flex justify-content-center classificacaoHeaderTD'><div className='classificacaoHeader' style={{ backgroundColor: 'rgb(54, 162, 235)' }}></div></td>
                                                            <td className='text-right'>Placar cheio</td>
                                                            <td className='text-center placarClassificacao'>{authenticatedUser?.placarCheio}</td>
                                                            <td className='text-center placarClassificacao'>{user ? user.placarCheio : ''}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className='d-flex justify-content-center classificacaoHeaderTD'><div className='classificacaoHeader' style={{ backgroundColor: 'rgb(75, 192, 192)' }}></div></td>
                                                            <td className='text-right'>Placar time vencedor c/ gol</td>
                                                            <td className='text-center placarClassificacao'>{authenticatedUser?.placarTimeVencedorComGol}</td>
                                                            <td className='text-center placarClassificacao'>{user ? user.placarTimeVencedorComGol : ''}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className='d-flex justify-content-center classificacaoHeaderTD'><div className='classificacaoHeader' style={{ backgroundColor: 'rgb(255, 159, 64)' }}></div></td>
                                                            <td className='text-right'>Placar time vencedor</td>
                                                            <td className='text-center placarClassificacao'>{authenticatedUser?.placarTimeVencedor}</td>
                                                            <td className='text-center placarClassificacao'>{user ? user.placarTimeVencedor : ''}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className='d-flex justify-content-center classificacaoHeaderTD'><div className='classificacaoHeader' style={{ backgroundColor: 'rgb(255, 205, 86)' }}></div></td>
                                                            <td className='text-right'>Placar Gol</td>
                                                            <td className='text-center placarClassificacao'>{authenticatedUser?.placarGol}</td>
                                                            <td className='text-center placarClassificacao'>{user ? user.placarGol : ''}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className='d-flex justify-content-center classificacaoHeaderTD'><div className='classificacaoHeader' style={{ backgroundColor: 'rgb(115,129,143)' }}></div></td>
                                                            <td className='text-right'>Total acumulado</td>
                                                            <td className='text-center placarClassificacao'>{authenticatedUser?.totalAcumulado}</td>
                                                            <td className='text-center placarClassificacao'>{user ? user.totalAcumulado : ''}</td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>
                                <div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
                                    <Card>
                                        <CardBody>
                                            <div className='col-sm-12 mb-3'>
                                                <h5 className='mb-0 card-title'>Classificação</h5>
                                                <div className='small'>Histórico de classificações</div>
                                            </div>
                                            <div style={{ height: '310px', padding: '5px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)'}}>
                                                <Line data={montarGraficoClassificacaoGeral()} options={chartLineOpts} height={200} redraw={true} />
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>
                            </Row>
                        </>
                    </If>
                </CardBody>
            </Card>
        </div>
    )
}

export default disputa