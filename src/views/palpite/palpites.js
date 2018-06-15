import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment'

import { Card, CardHeader, CardBody, CustomInput, Table } from 'reactstrap'

import { search } from '../user/userActions'

class Palpite extends Component {
	constructor(props) {
		super(props)
		this.state = { userId: '', users: [] }
	}
	componentWillMount() {
		this.props.search()
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.users && this.props.users && nextProps.users.length != this.props.users.length) {
			this.setState({ userId: this.state.userId, users: nextProps.users })
		}
	}
	handleChange = event => {
		const userId = event.target.value
		if (userId) {
			const users = this.props.users.filter(user => user._id === userId)
			this.setState({ userId, users })
		} else {
			this.setState({ userId: undefined, users: this.props.users })
		}
	}
	render() {
		const users = this.state.users
		return (
			<Card>
				<CardHeader className='d-flex align-items-center justify-content-between'>
					<span>Escolha o usuário e fase que você deseja ver os palpites</span>
					<div>
						<CustomInput id='userId' name='userId' type='select' value={this.state.userId || ''} onChange={this.handleChange}>
							<option value={''}>Todos os Usuários</option>
							{this.props.users.map(user => (
								<option key={user._id} value={user._id}>{user.name}</option>
							))}
						</CustomInput>
					</div>
				</CardHeader>
				<CardBody style={{ padding: '0px' }}>
					{users.map(user => (
						<Card key={user._id}>
							<CardHeader>{user.name}</CardHeader>
							<CardBody style={{ padding: '0px' }}>
								<Table responsive striped borderless>
									<thead>
										<tr className='gridResultados'>
											<th className='text-center'>#</th>
											<th className='text-center'>Partida</th>
										</tr>
									</thead>
									<tbody>
										{user.palpites.map((palpite, idx) => (
											<tr key={palpite._id} className='gridResultados'>
												<td className='text-center'>{idx + 1}</td>
												<td className='text-center'>
													<div key={idx} className='rodada'>
														<div className='nomeTimeA'>
															<span className='h6 nomeTimeA'>{palpite.partida.timeA.sigla}</span>
														</div>
														<div className='bandeiraTimeA'>
															<i className={`bandeiraTimeA flag-icon flag-icon-${palpite.partida.timeA.bandeira}`} />
														</div>
														<div className='palpiteTimeA'>
															{palpite.placarTimeA}
														</div>
														<div className='divisorPalpite'>x</div>
														<div className='palpiteTimeB'>
															{palpite.placarTimeB}
														</div>
														<div className='bandeiraTimeB'>
															<i className={`bandeiraTimeB flag-icon flag-icon-${palpite.partida.timeB.bandeira}`} />
														</div>
														<div className='nomeTimeB'>
															<span className='h6 nomeTimeB'>{palpite.partida.timeB.sigla}</span>
														</div>
														<div className='horaPartida'>
															<span className='horaPartida text-secundary'>{moment(palpite.partida.data, 'YYYY/MM/DD hh:mm:ss').format('DD/MM/YYYY HH:mm')}</span>
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
}

const mapStateToProps = state => ({ users: state.userStore.users })
const mapDispatchToProps = dispatch => bindActionCreators({ search }, dispatch)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Palpite))