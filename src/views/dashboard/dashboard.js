import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Container, Row, Card, CardHeader, CardBody } from 'reactstrap'
import { Bar, Line } from 'react-chartjs-2';

import { search } from '../palpite/palpiteActions'
import blackAvatar from '../../assets/img/blankavatar.svg'

const cardChartData = {
	labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
	datasets: [
		{
			backgroundColor: 'rgb(99,194,222,.1)',
			borderColor: 'rgb(99,194,222)',
			borderWidth: 2,
			pointBorderColor: 'rgba(75,192,192,1)',
			pointBackgroundColor: '#FFFFFF',
			pointBorderWidth: 2,
			pointHoverBackgroundColor: '#C0C0C0',
			pointHoverBorderColor: 'rgba(75,192,192,1)',
			pointHoverBorderWidth: 2,
			pointRadius: 4,
			data: [7, 10, 8, 9, 6, 3, 5, 9, 6, 6, 5, 4, 4, 4, 2, 1],
		},
	],
};

const cardChartOpts = {
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
				stepSize: 2
			},
		}],
	}
};

class Dashboard extends Component {

	componentWillMount() {
		const user = this.props.getAuthenticatedUser()
		this.props.search(user)
	}

	render() {
		const user = this.props.getAuthenticatedUser()
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
								<h3 className="mb-1 card-title">Classificação: {user.classificacao}</h3>
								<h5 className="text-muted">Total pontos: {user.totalAcumulado}</h5>
							</div>
						</Card>
					</div>
					<div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
						<Card>
							<CardBody>
								<div className="col-sm-12 mb-3">
									<h5 className="mb-0 card-title">Classificação</h5>
									<div className="small text-muted">Histórico de classificação por partida</div>
								</div>
								<div className="chart-wrapper">
									<Line data={cardChartData} options={cardChartOpts} height={150} />
								</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
						<Card>
							<CardBody>
								<div className="col-sm-12 mb-3">
									<h5 className="mb-0 card-title">Pontuações</h5>
									<div className="small text-muted">Acumulo de pontuação por partida</div>
								</div>
								<div className="chart-wrapper">
									<Bar data={cardChartData} options={cardChartOpts} height={150} />
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
const mapDispatchToProps = dispatch => bindActionCreators({ search }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)