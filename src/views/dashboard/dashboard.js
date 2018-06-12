import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Container, Row, Card, CardBody } from 'reactstrap'
import { Bar, Line, Pie } from 'react-chartjs-2';

import { search as searchPalpites } from '../palpite/palpiteActions'
import blackAvatar from '../../assets/img/blankavatar.svg'

const chartLineData = {
	labels: [],
	datasets: [
		{
			fill: "start",
			backgroundColor: 'rgb(54, 162, 235,.1)',
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

const chartBarData = {
	labels: [],
	datasets: [
		{
			backgroundColor: 'rgb(75, 192, 192,.1)',
			borderColor: 'rgb(75, 192, 192)',
			borderWidth: 2,
			pointBorderColor: 'rgb(75, 192, 192)',
			pointBackgroundColor: '#FFFFFF',
			pointBorderWidth: 2,
			pointHoverBackgroundColor: '#DEDEDE',
			pointHoverBorderColor: 'rgb(75, 192, 192)',
			pointHoverBorderWidth: 2,
			pointRadius: 4,
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
				'rgb(255, 159, 64)',
				'rgb(255, 205, 86)',
				'rgb(255, 99, 132)',
			],
			data: [],
		},
	],
};


const chartLineOpts = {
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
				min: 1,
				reverse: true,
				stepSize: 1
			},
		}],
	}
};

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

				beginAtZero: true,
			},
		}],
	}
};

class Dashboard extends Component {

	componentWillMount() {
		const user = this.props.getAuthenticatedUser()
		this.props.searchPalpites(user)
	}
/*
	gerarDados(palpites) {
		if (palpites.length) {
			let acumulado = 0
			for(let i = 0; i < palpites.length; i++) {
				palpites[i].classificacao = Math.floor(Math.random() * 10)
				palpites[i].totalPontosObitidos = Math.floor(Math.random() * 5) + 1
				switch(palpites[i].totalPontosObitidos) {
					case 5:
						palpites[i].placarCheio = true
						break
					case 3:
						palpites[i].placarTimeVencedorComGol = true
						break
					case 2:
						palpites[i].placarTimeVencedor = true
						break
					case 1:
						palpites[i].placarGol = true
						break
					default:
						break
				}
				acumulado += palpites[i].totalPontosObitidos
				palpites[i].totalAcumulado = acumulado
			}
		}
	}
*/
	montarGraficoClassificacoes = palpites => {
		chartLineData.labels = []
		chartLineData.datasets[0].data = []
		if (palpites.length) {
			palpites = palpites.sort((p1, p2) => { p1.partida.order > p2.partida.order}).slice(Math.max(palpites.length - 10, 1))
			for(let i = 0; i < palpites.length; i++) {
				chartLineData.labels.push('')
				chartLineData.datasets[0].data.push(palpites[i].classificacao)
			}
		}
		return chartLineData
	}

	montarGraficoPontuacoes = palpites => {
		chartBarData.labels = []
		chartBarData.datasets[0].data = []
		if (palpites.length) {
			palpites = palpites.sort((p1, p2) => { p1.partida.order > p2.partida.order}).slice(Math.max(palpites.length - 10, 1))
			for(let i = 0; i < palpites.length; i++) {
				chartBarData.labels.push('')
				chartBarData.datasets[0].data.push(palpites[i].totalAcumulado)
			}
		}
		return chartBarData
	}

	montarGraficoPontuacoesPorTipo = palpites => {
		chartPieData.labels = []
		chartPieData.datasets[0].data = []
		let placarCheio = 0
		let placarTimeVencedorComGol = 0
		let placarTimeVencedor = 0
		let placarGol = 0
		let nada = 0
		if (palpites.length) {
			palpites = palpites.sort((p1, p2) => { p1.partida.order > p2.partida.order}).slice(Math.max(palpites.length - 5, 1))
			for(let i = 0; i < palpites.length; i++) {
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

	render() {
		const user = this.props.getAuthenticatedUser()
		const palpites = this.props.palpites
		const lastPalpite = palpites[palpites.length - 1]
		//this.gerarDados(palpites)
		return (
			<Container fluid>
				<Row>
					<div className='col-12'>
						<Card style={{ display: 'grid', gridTemplateColumns: '50px 20px 1fr', alignItems: 'center', padding: '20px', backgroundColor: 'white' }}>
							<div>
								<img alt='avatar' src={user.avatar ? `https://graph.facebook.com/${user.facebookId}/picture?width=${500}&height=${500}` : blackAvatar} className='img-avatar' width={50} height={50} />
							</div>
							<div />
							<div>
								<h3 className="mb-1 card-title">Classificação: {lastPalpite ? lastPalpite.classificacao : ''}</h3>
								<h5 className="text-muted">Total pontos: {lastPalpite ? lastPalpite.totalAcumulado : ''}</h5>
							</div>
						</Card>
					</div>
					<div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
						<Card>
							<CardBody style={{ padding: '10px'}}>
								<div className="col-sm-12 mb-3">
									<h5 className="mb-0 card-title">Classificação</h5>
									<div className="small text-muted">Histórico de classificação por partida</div>
								</div>
								<div className="chart-wrapper">
									<Line data={this.montarGraficoClassificacoes(palpites)} options={chartLineOpts} height={150} />
								</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
						<Card>
							<CardBody style={{ padding: '10px'}}>
								<div className="col-sm-12 mb-3">
									<h5 className="mb-0 card-title">Pontuações</h5>
									<div className="small text-muted">Acumulo de pontuação por partida</div>
								</div>
								<div className="chart-wrapper">
									<Bar data={this.montarGraficoPontuacoes(palpites)} options={chartBarOpts} height={150} />
								</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
						<Card>
							<CardBody style={{ padding: '10px'}}>
								<div className="col-sm-12 mb-3">
									<h5 className="mb-0 card-title">Pontuações por tipo</h5>
									<div className="small text-muted">Total de pontuações por tipo</div>
								</div>
								<div className="chart-wrapper">
									<Pie data={this.montarGraficoPontuacoesPorTipo(palpites)} height={150} />
								</div>
							</CardBody>
						</Card>
					</div>
				</Row>
			</Container>
		)
	}
}

const mapStateToProps = state => ({ palpites: state.palpiteStore.palpites })
const mapDispatchToProps = dispatch => bindActionCreators({ searchPalpites }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)