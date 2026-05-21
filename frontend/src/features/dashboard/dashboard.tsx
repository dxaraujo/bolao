import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { Alert, Card, CardBody, Row } from 'reactstrap'
import { ChartData, ChartOptions, Chart, registerables } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2'

import If from '../../app/components/if';
import { selectAuthUser } from '../../app/auth/authSlice';
import { getConfigsAsync, selectAtualizandoPontuacoes } from '../../app/config/configSlice';
import {
	betsUpToMatch,
	lastFinishedMatchId,
	matchLabel,
	sortBetsByMatchDate,
} from '../../lib/domain';
import { getPartidasAsync, selectPartidas } from '../partida/partidaSlice';
import { getUsersAsync, select, selectUsers, UserType } from '../user/userSlice';

import blankavatar from '../../assets/img/blankavatar.svg'
import { PalpiteType } from '../palpite/palpiteSlice';

const colors = [
	'rgb(54, 162, 235)',
    'rgb(75, 192, 192)',
    'rgb(255, 159, 64)',
    'rgb(255, 205, 86)',
    'rgb(255, 99, 132)',
]

const chartLineData: ChartData<'line'>  = {
	labels: [],
	datasets: [
		{
			fill: 'start',
			backgroundColor: 'rgba(54, 162, 235,.1)',
			borderColor: 'rgb(54, 162, 235)',
			borderWidth: 2,
			pointBorderColor: 'rgb(54, 162, 235)',
			pointBackgroundColor: '#FFFFFF',
			pointBorderWidth: 2,
			pointHoverBackgroundColor: '#DEDEDE',
			pointHoverBorderColor: 'rgb(54, 162, 235)',
			pointHoverBorderWidth: 2,
			pointRadius: 4,
			data: [],
		},
	],
};

const chartClassificacaoData: ChartData<'line'> = {
	labels: [],
	datasets: []
}

const chartBarData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
        backgroundColor: [],
        borderColor: [],
        borderWidth: 2,
        data: []
    }]
};

const chartPieData: ChartData<'pie'> = {
	labels: [],
	datasets: [
		{
			backgroundColor: [
                'rgb(54, 162, 235)',
				'rgb(75, 192, 192)',
                'rgb(255, 159, 64)',
				'rgb(255, 205, 86)',
				'rgb(255, 99, 132)',
			],
			data: [],
		},
	],
};

const chartLineOpts: (display: boolean) => ChartOptions<'line'> = (display) => ({
    maintainAspectRatio: false,
    responsive: true,
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
    },
    plugins: {
        legend: {
            display
        },
    }
})

const chartBarOpts: ChartOptions<'bar'> = {
    maintainAspectRatio: false,
    responsive: true,
	scales: {
		x: {
			grid: {
				display: false,
			},
		},
		y: {
            min: 0,
            ticks: {
                stepSize: 1
            }
		},
	},
    plugins: {
        legend: {
            display: false
        },
    }
};

const dashboard = () => {

    Chart.register(...registerables)

    const dispatch = useAppDispatch()
    const authUser = useAppSelector(selectAuthUser)
    const partidas = useAppSelector(selectPartidas)
	const users = useAppSelector(selectUsers)
    const atualizandoPontuacoes = useAppSelector(selectAtualizandoPontuacoes)

    const [user, setUser] = useState<UserType>({})

    useEffect(() => {
        dispatch(getPartidasAsync())
		dispatch(getUsersAsync())
        dispatch(getConfigsAsync())
	}, [])

    useEffect(() => {
        if (users.length > 0) {
            setUser(users.find(user => user._id === authUser?._id) || {})
        }
	}, [users])

    const encontrarUltimaPartida = (): number => lastFinishedMatchId(partidas)

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

    const montarGraficoClassificacoes = (allBets: PalpiteType[]) => {
		if (allBets !== undefined && allBets.length) {
            chartLineData.labels = []
            chartLineData.datasets[0].data = []
            const ultimaPartida = encontrarUltimaPartida()
            const bets = betsUpToMatch(allBets, ultimaPartida).slice(-10)
			for (let i = 0; i < bets.length; i++) {
				chartLineData.labels.push(matchLabel(bets[i].match))
				chartLineData.datasets[0].data.push(bets[i].classificacao!)
			}
		}
		return chartLineData
	}

    const montarGraficoPontuacoes = (bets: PalpiteType[]) => {
        if (bets !== undefined && bets.length) {

            const ultimaPartida = encontrarUltimaPartida()
            const labels = new Array<string>()
            const data = new Array<number>()
            const backgroundColor = new Array<string>()
            const borderColor = new Array<string>()

            const betsOrdenados = betsUpToMatch(bets, ultimaPartida).slice(-10)
			for (let i = 0; i < betsOrdenados.length; i++) {
				labels.push(matchLabel(betsOrdenados[i].match))
				data.push(betsOrdenados[i].totalPontosObitidos!)
				if (betsOrdenados[i].totalPontosObitidos === 5) {
                    backgroundColor.push('rgba(54, 162, 235, .1)')
                    borderColor.push('rgba(54, 162, 235, 1)')
				} else if (betsOrdenados[i].totalPontosObitidos === 3) {
                    backgroundColor.push('rgba(75, 192, 192, .1)')
                    borderColor.push('rgba(75, 192, 192, 1)')
				} else if (betsOrdenados[i].totalPontosObitidos === 2) {
                    backgroundColor.push('rgba(255, 159, 64, .1)')
                    borderColor.push('rgba(255, 159, 64, 1)')
				} else if (betsOrdenados[i].totalPontosObitidos === 1) {
                    backgroundColor.push('rgba(255, 205, 86, .1)')
                    borderColor.push('rgba(255, 205, 86, 1)')
				} else {
                    backgroundColor.push('rgba(255, 99, 132, .1)')
                    borderColor.push('rgba(255, 99, 132, 1)')
				}
			}

            chartBarData.labels = labels
            chartBarData.datasets[0].data = data
            chartBarData.datasets[0].backgroundColor = backgroundColor
            chartBarData.datasets[0].borderColor = borderColor
		}
		return chartBarData
	}

    const montarGraficoPontuacoesPorTipo = (bets: PalpiteType[]) => {
		chartPieData.labels = []
		chartPieData.datasets[0].data = []
		let placarCheio = 0
		let placarTimeVencedorComGol = 0
		let placarTimeVencedor = 0
		let placarGol = 0
		let nada = 0
		if (bets && bets.length) {
			const betsOrdenados = sortBetsByMatchDate(bets)
			for (let i = 0; i < betsOrdenados.length; i++) {
				const palpite = betsOrdenados[i]
				if (palpite.placarCheio) {
					placarCheio++
				} else if (palpite.placarTimeVencedorComGol) {
					placarTimeVencedorComGol++
				} else if (palpite.placarTimeVencedor) {
					placarTimeVencedor++
				} else if (palpite.placarGol) {
					placarGol++
				} else {
					nada++
				}
			}
			chartPieData.labels.push('Cheio')
			chartPieData.labels.push('Resultado mais gol')
			chartPieData.labels.push('Resultado')
			chartPieData.labels.push('Gol')
			chartPieData.labels.push('Não pontuou')
			chartPieData.datasets[0].data.push(placarCheio)
			chartPieData.datasets[0].data.push(placarTimeVencedorComGol)
			chartPieData.datasets[0].data.push(placarTimeVencedor)
			chartPieData.datasets[0].data.push(placarGol)
			chartPieData.datasets[0].data.push(nada)
		}
		return chartPieData
	}

    const montarGraficoClassificacaoGeral = () => {
		chartClassificacaoData.labels = []
		chartClassificacaoData.datasets = []
		const ultimaPartida = encontrarUltimaPartida()
        const orederUsers = ordenarUsuarios(users)
        let userIndex = orederUsers.findIndex(u => u._id === user._id)
        if (userIndex >= 0) {
            if (userIndex === 0) {
                userIndex = 0
            } else if (userIndex === orederUsers.length - 1) {
                userIndex -= 2
            } else {
                userIndex -= 1
            }
            let colorIndex = 0
            for (let i = userIndex; i < userIndex + 3; i++) {
                const orderUser = orederUsers[i]
                let data: number[] = []
                if (orderUser) {
                    chartClassificacaoData.datasets.push({
                        data,
                        label: orderUser.name,
                        fill: false,
                        backgroundColor: colors[colorIndex],
                        borderColor: colors[colorIndex],
                        borderWidth: 2,
                        pointBorderColor: colors[colorIndex],
                        pointBackgroundColor: colors[colorIndex],
                        pointBorderWidth: 2,
                        pointHoverBackgroundColor: colors[colorIndex],
                        pointHoverBorderColor: colors[colorIndex],
                        pointHoverBorderWidth: 2,
                        pointRadius: 2,
                    })
                    if (orderUser.bets !== undefined && orderUser.bets.length > 0) {
                        const bets = betsUpToMatch(orderUser.bets, ultimaPartida).slice(-10)
                        for (let j = 0; j < bets.length; j++) {
                            if (i === userIndex) {
                                chartClassificacaoData.labels.push(matchLabel(bets[j].match))
                            }
                            data.push(bets[j].classificacao!)
                        }
                    }
                    colorIndex++
                }
            }
        }
		return chartClassificacaoData
	}

    return (
        <Row>
            <div className='col-12'>
                {atualizandoPontuacoes && (<Alert color='warning' className='alert-sem-margin-bottom'>Atenção, atualização de resultados em andamento!</Alert>)}
                <Card style={{ display: 'grid', gridTemplateColumns: '50px 20px 1fr', alignItems: 'center', padding: '20px', backgroundColor: 'white' }}>
                    <div>
                        <img alt='avatar' src={user ? (user.picture ? user.picture.replace('s96-c', 's200-c') : blankavatar) : blankavatar} className='img-avatar' width={50} height={50} referrerPolicy='no-referrer' />
                    </div>
                    <div />
                    <If test={user !== undefined && user.ativo === true}>
                        <div>
                            <h3 className='mb-1 card-title'>Classificação: { user !== undefined && user.bets !== undefined && user.classificacao !== undefined ? user.classificacao : '0' }</h3>
                            <h5 className='text-muted'>Total pontos: { user !== undefined && user.bets !== undefined && user.totalAcumulado !== undefined ? user.totalAcumulado : '0' }</h5>
                        </div>
                    </If>
                    <If test={user !== undefined && user.ativo === false}>
                        <div>
                            <h3 className='mb-1 card-title'>Usuário inativo</h3>
                            <h5 className='text-muted'>Entre em contato com os administradores para participar do bolão</h5>
                        </div>
                    </If>
                    <If test={user !== undefined && user.ativo === undefined}>
                        <div>
                            <h3 className='mb-1 card-title'></h3>
                            <h5 className='text-muted'></h5>
                        </div>
                    </If>
                </Card>
            </div>
            <If test={user !== undefined && user.ativo === true}>
                <>
                    <div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
                        <Card>
                            <CardBody>
                                <div className='col-sm-12 mb-3'>
                                    <h5 className='mb-0 card-title'>Classificação</h5>
                                    <div className='small text-muted'>Histórico de classificação por partida</div>
                                </div>
                                <div className='chart-wrapper'>
                                    <Line data={montarGraficoClassificacoes(user.bets!)} options={chartLineOpts(false)} height={150} redraw={true} />
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                    <div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
                        <Card>
                            <CardBody>
                                <div className='col-sm-12 mb-3'>
                                    <h5 className='mb-0 card-title'>Pontuações</h5>
                                    <div className='small text-muted'>Pontuações obtidas por partida</div>
                                </div>
                                <div className='chart-wrapper'>
                                    <Bar data={montarGraficoPontuacoes(user.bets!)} options={chartBarOpts} height={150} redraw={true} />
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                    <If test={users.length > 0}>
                        <div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
                            <Card>
                                <CardBody>
                                    <div className='col-sm-12 mb-3'>
                                        <h5 className='mb-0 card-title'>Classificação geral</h5>
                                        <div className='small text-muted'>Histórico das classificações</div>
                                    </div>
                                    <div className='chart-wrapper'>
                                        <Line data={montarGraficoClassificacaoGeral()} options={chartLineOpts(true)} height={150} redraw={true} />
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </If>
                    <div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
                        <Card>
                            <CardBody>
                                <div className='col-sm-12 mb-3'>
                                    <h5 className='mb-0 card-title'>Pontuações por tipo</h5>
                                    <div className='small text-muted'>Total de pontuações por tipo</div>
                                </div>
                                <div className='chart-wrapper'>
                                    <Pie data={montarGraficoPontuacoesPorTipo(user.bets!)} options={{ maintainAspectRatio: false, responsive: true }} height={150} redraw={true} />
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </>
            </If>
        </Row>
    )
}

export default dashboard