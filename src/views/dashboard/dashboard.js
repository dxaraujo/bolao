import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Row, Card, CardBody } from 'reactstrap'
import { Chart, Bar, Line, Pie } from 'react-chartjs-2';

import If from '../../components/if'
import { searchAtivos as searchUsers } from '../user/userActions'
import { search as searchPartidas } from '../partida/partidaActions'
import { search as searchPalpites } from '../palpite/palpiteActions'

import blackAvatar from '../../assets/img/blankavatar.svg'

const colors = [
	'rgb(54, 162, 235)',
	'rgb(75, 192, 192)',
	'rgb(201, 203, 207)',
	'rgb(255, 159, 64)',
	'rgb(153, 102, 255)',
	'rgb(255, 99, 132)',
	'rgb(255, 205, 86)'
]

const chartLineData = {
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

const chartClassificacaoData = {
	labels: [],
	datasets: []
}

const chartBarData = {
	labels: [],
	datasets: [
		{
			backgroundColor: [],
			borderColor: [],
			borderWidth: 2,
			data: [],
		},
	],
};

const chartPieData = {
	labels: [],
	datasets: [
		{
			backgroundColor: [
				'rgb(75, 192, 192)',
				'rgb(54, 162, 235)',
				'rgb(255, 205, 86)',
				'rgb(255, 159, 64)',
				'rgb(255, 99, 132)',
			],
			data: [],
		},
	],
};


const chartLineOpts = (display, step) => ({
	legend: {
		display: display,
	},
	scales: {
		xAxes: [{
			gridLines: {
				drawOnChartArea: false,
			},
		}],
		yAxes: [{
			ticks: {
				min: 1,
				reverse: true,
				stepSize: step
			},
		}],
	}
});

const chartBarOpts = {
	legend: {
		display: false,
	},
	scales: {
		xAxes: [{
			gridLines: {
				drawOnChartArea: false,
			},
		}],
		yAxes: [{
			ticks: {
				beginAtZero: true
			},
		}],
	}
};

class Dashboard extends Component {

	componentWillMount() {
		this.props.searchUsers()
		this.props.searchPartidas()
		this.props.searchPalpites(this.props.getAuthenticatedUser())
		Chart.pluginService.register({
			beforeRender: function (chartInstance) {
				var datasets = chartInstance.config.data.datasets;
				for (var i = 0; i < datasets.length; i++) {
					var meta = datasets[i]._meta;
					var metaData = meta[Object.keys(meta)[0]];
					var bars = metaData.data;
					for (var j = 0; j < bars.length; j++) {
						var model = bars[j]._model;
						if (metaData.type === 'horizontalBar' && model.base === model.x) {
							model.x = model.base + 2;
						} else if (model.base === model.y) {
							model.y = model.base - 2;
						}
					}
				}
			}
		});
	}

	encontrarUltimaPartida() {
		let ultimaPartida
		this.props.partidas.forEach(partida => {
			if (partida.placarTimeA >= 0 && partida.placarTimeB >= 0) {
				ultimaPartida = partida.order
			}
		});
		return ultimaPartida
	}

	montarGraficoClassificacoes = allPalpites => {
		chartLineData.labels = []
		chartLineData.datasets[0].data = []
		if (allPalpites.length) {
			let palpites = allPalpites.sort((p1, p2) => p1.partida.order - p2.partida.order)
			palpites = palpites.slice(Math.max(palpites.length - 10, 0))
			for (let i = 0; i < palpites.length; i++) {
				chartLineData.labels.push(`${palpites[i].partida.timeA.sigla} x ${palpites[i].partida.timeB.sigla}`)
				chartLineData.datasets[0].data.push(palpites[i].classificacao)
			}
		}
		return chartLineData
	}

	montarGraficoPontuacoes = allPalpites => {
		chartBarData.labels = []
		chartBarData.datasets[0].data = []
		chartBarData.datasets[0].backgroundColor = []
		chartBarData.datasets[0].borderColor = []
		if (allPalpites.length) {
			let palpites = allPalpites.sort((p1, p2) => p1.partida.order - p2.partida.order)
			palpites = palpites.slice(Math.max(palpites.length - 10, 0))
			for (let i = 0; i < palpites.length; i++) {
				chartBarData.labels.push(`${palpites[i].partida.timeA.sigla} x ${palpites[i].partida.timeB.sigla}`)
				chartBarData.datasets[0].data.push(palpites[i].totalPontosObitidos)
				if (palpites[i].totalPontosObitidos === 5) {
					chartBarData.datasets[0].backgroundColor.push('rgba(75, 192, 192,.1)')
					chartBarData.datasets[0].borderColor.push('rgb(75, 192, 192)')
				} else if (palpites[i].totalPontosObitidos === 3) {
					chartBarData.datasets[0].backgroundColor.push('rgba(54, 162, 235,.1)')
					chartBarData.datasets[0].borderColor.push('rgb(54, 162, 235)')
				} else if (palpites[i].totalPontosObitidos === 2) {
					chartBarData.datasets[0].backgroundColor.push('rgba(255, 205, 86,.1)')
					chartBarData.datasets[0].borderColor.push('rgb(255, 205, 86)')
				} else if (palpites[i].totalPontosObitidos === 1) {
					chartBarData.datasets[0].backgroundColor.push('rgba(255, 159, 64,.1)')
					chartBarData.datasets[0].borderColor.push('rgb(255, 159, 64)')
				} else {
					chartBarData.datasets[0].backgroundColor.push('rgba(255, 99, 132,.1)')
					chartBarData.datasets[0].borderColor.push('rgb(255, 99, 132)')
				}
			}
		}
		return chartBarData
	}

	montarGraficoPontuacoesPorTipo = allPalpites => {
		chartPieData.labels = []
		chartPieData.datasets[0].data = []
		let placarCheio = 0
		let placarTimeVencedorComGol = 0
		let placarTimeVencedor = 0
		let placarGol = 0
		let nada = 0
		if (allPalpites.length) {
			let palpites = allPalpites.sort((p1, p2) => p1.partida.order - p2.partida.order)
			for (let i = 0; i < palpites.length; i++) {
				const palpite = palpites[i]
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

	montarGraficoClassificacaoGeral = (auser, ultimaPartida) => {
		chartClassificacaoData.labels = []
		chartClassificacaoData.datasets = []
		if (this.props.users.length > 0) {
			let userIndex = this.props.users.findIndex(u => u.email === auser.email)
			if (userIndex >= 0) {
				if (userIndex === 0) {
					userIndex = 0
				} else if (userIndex === this.props.users.length - 1) {
					userIndex -= 2
				} else {
					userIndex -= 1
				}
				for (let i = userIndex; i < userIndex + 3; i++) {
					const user = this.props.users[i]
					let data = []
					if (user) {
						chartClassificacaoData.datasets.push({
							data,
							label: user.name,
							fill: false,
							backgroundColor: colors[i % colors.length],
							borderColor: colors[i % colors.length],
							borderWidth: 2,
							pointBorderColor: colors[i % colors.length],
							pointBackgroundColor: colors[i % colors.length],
							pointBorderWidth: 2,
							pointHoverBackgroundColor: colors[i % colors.length],
							pointHoverBorderColor: colors[i % colors.length],
							pointHoverBorderWidth: 2,
							pointRadius: 2,
						})
						if (user.palpites) {
							let palpites = user.palpites.filter(palpite => palpite.partida.order <= ultimaPartida)
							palpites = palpites.slice(Math.max(palpites.length - 10, 0))
							for (let j = 0; j < palpites.length; j++) {
								if (i === userIndex) {
									chartClassificacaoData.labels.push(`${palpites[j].partida.timeA.sigla} x ${palpites[j].partida.timeB.sigla}`)
								}
								data.push(palpites[j].classificacao)
							}
						}
					}
				}
			}
		}
		return chartClassificacaoData
	}

	render() {
		const user = this.props.users.find(u => u.email === this.props.getAuthenticatedUser().email)
		const ultimaPartida = this.encontrarUltimaPartida()
		const palpites = this.props.palpites.filter(palpite => palpite.partida.order <= ultimaPartida)
		return (
			<Row>
				<div className='col-12'>
					<Card style={{ display: 'grid', gridTemplateColumns: '50px 20px 1fr', alignItems: 'center', padding: '20px', backgroundColor: 'white' }}>
						<div>
							<img alt='avatar' src={user ? user.picture : blackAvatar} className='img-avatar' width={50} height={50} />
						</div>
						<div />
						<If test={user ? user.ativo : false}>
							<div>
								<h3 className='mb-1 card-title'>Classificação: {palpites.length > 0 ? palpites[palpites.length - 1].classificacao : '0'}</h3>
								<h5 className='text-muted'>Total pontos: {palpites.length > 0 ? palpites[palpites.length - 1].totalAcumulado : '0'}</h5>
							</div>
						</If>
						<If test={user ? !user.ativo : false}>
							<div>
								<h3 className='mb-1 card-title'>Usuário inativo</h3>
								<h5 className='text-muted'>Entre em contato com os administradores para participar do bolão</h5>
							</div>
						</If>
					</Card>
				</div>
				<If test={user ? user.ativo : false}>
					<div className='col-12'>
						<div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
							<Card>
								<CardBody>
									<div className='col-sm-12 mb-3'>
										<h5 className='mb-0 card-title'>Classificação</h5>
										<div className='small text-muted'>Histórico de classificação por partida</div>
									</div>
									<div className='chart-wrapper'>
										<Line data={this.montarGraficoClassificacoes(palpites)} options={chartLineOpts(false, 1)} height={150} />
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
										<Bar data={this.montarGraficoPontuacoes(palpites, 2)} options={chartBarOpts} height={150} />
									</div>
								</CardBody>
							</Card>
						</div>
						<If test={this.props.users.length > 0}>
							<div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
								<Card>
									<CardBody>
										<div className='col-sm-12 mb-3'>
											<h5 className='mb-0 card-title'>Classificação geral</h5>
											<div className='small text-muted'>Histórico das classificações</div>
										</div>
										<div className='chart-wrapper'>
											<Line data={this.montarGraficoClassificacaoGeral(user, ultimaPartida)} options={chartLineOpts(true)} height={180} />
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
										<Pie data={this.montarGraficoPontuacoesPorTipo(palpites)} height={180} />
									</div>
								</CardBody>
							</Card>
						</div>
					</div>
				</If>
			</Row>
		)
	}
}

const mapStateToProps = state => ({ users: state.userStore.users, partidas: state.partidaStore.partidas, palpites: state.palpiteStore.palpites })
const mapDispatchToProps = dispatch => bindActionCreators({ searchUsers, searchPartidas, searchPalpites }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)