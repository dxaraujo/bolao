import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities'
import { Container, Row, Card, CardHeader, CardBody } from 'reactstrap'
import { Bar, Line } from 'react-chartjs-2';

import { search } from '../palpite/palpiteActions'
import blackAvatar from '../../assets/img/blankavatar.svg'

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')

console.log(brandInfo)


const cardChartData = {
	labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
	datasets: [
		{
			label: 'Colocação',
			backgroundColor: 'rgb(99,194,222,.1)',
			borderColor: 'rgb(99,194,222)',
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
	},
	elements: {
		line: {
			borderWidth: 2,
		},
		point: {
			radius: 4,
			hitRadius: 10,
			hoverRadius: 4,
			hoverBorderWidth: 3,
			backgroundColor: 'white'
		},
	},
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
								<img alt='avatar' className='img-avatar' src={user.avatar ? user.avatar : blackAvatar} />
							</div>
							<div />
							<div>
								<h3 class="mb-1 card-title">Classificação: {user.classificacao}</h3>
								<h5 class="text-muted">Total pontos: {user.totalAcumulado}</h5>
							</div>
						</Card>
					</div>
					<div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
						<Card>
							<CardBody>
								<div class="col-sm-12 mb-3">
									<h5 class="mb-0 card-title">Classificação</h5>
									<div class="small text-muted">Histórico de classificação por partida</div>
								</div>
								<div className="chart-wrapper">
									<Line data={cardChartData} options={cardChartOpts} height={150} />
								</div>
							</CardBody>
						</Card>
					</div>
					<div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
						<Card>
							<CardHeader>Pontuacões</CardHeader>
							<CardBody>
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