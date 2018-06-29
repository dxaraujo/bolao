import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Card, CardHeader, CardBody, CustomInput, Table } from 'reactstrap'

import { search } from '../user/userActions'
import { search as searchPartidas } from '../partida/partidaActions'

class Palpite extends Component {
	constructor(props) {
		super(props)
		this.state = { partidaId: 'TODAS', partidas: [] }
	}
	componentWillMount() {
		//this.props.searchPartidas()
		//this.props.search()
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.partidas && nextProps.partidas.length > 0) {
			let partidas = this.filtrarPartidas(nextProps.partidas)
			const partidaId = this.encontrarUltimaClassificacao(partidas)
			partidas = nextProps.partidas.filter(partida => partida._id === partidaId)
			for (let i = 0; i < partidas.length; i++) {
				partidas[i] = { ...partidas[i] }
			}
			this.setState({ partidaId, partidas: [...partidas] })
		}
	}
	filtrarPartidas(partidas) {
		return partidas.filter(partida => {
			let estaDisponivelParaConsulta = false
			for (let i = 0; i < this.props.fases.length; i++) {
				const fase = this.props.fases[i];
				if (partida.fase === fase.nome) {
					estaDisponivelParaConsulta = fase.status === 'B'
				}
			}
			return estaDisponivelParaConsulta
		})
	}
	encontrarUltimaClassificacao(partidas) {
		let ultimaClassificacao
		partidas.forEach(partida => {
			if (partida.placarTimeA >= 0 && partida.placarTimeB >= 0) {
				ultimaClassificacao = partida._id
			}
		});
		return ultimaClassificacao
	}
	handleChange = event => {
		const partidaId = event.target.value
		if (partidaId !== 'TODAS') {
			const partidas = this.filtrarPartidas(this.props.partidas).filter(partida => partida._id === partidaId)
			for (let i = 0; i < partidas.length; i++) {
				partidas[i] = { ...partidas[i] }
			}
			this.setState({ partidaId, partidas: [...partidas] })
		} else {
			const partidas = this.filtrarPartidas(this.props.partidas)
			for (let i = 0; i < partidas.length; i++) {
				partidas[i] = { ...partidas[i] }
			}
			this.setState({ partidaId, partidas: [...partidas] })
		}
	}
	render() {
		const users = this.props.users
		const partidas = this.state.partidas
		return (
			<Card>
				<CardHeader className='d-flex align-items-center justify-content-between'>
					<span>Visualizar palpites</span>
					<div>
						<CustomInput id='partidaId' type='select' value={this.state.partidaId || 'TODAS'} onChange={this.handleChange}>
							<option value={'TODAS'}>Todas as partidas</option>
							{this.filtrarPartidas(this.props.partidas).map(partida => (
								<option key={partida._id} value={partida._id}>{`${partida.timeA.nome} x ${partida.timeB.nome}`}</option>
							))}
						</CustomInput>
					</div>
				</CardHeader>
				<CardBody style={{ padding: '0px' }}>
					{partidas.map(partida => (
						<Card key={partida._id} style={{ marginBottom: '0px' }}>
							<CardHeader>{`${partida.timeA.nome} ${partida.placarTimeA} x ${partida.placarTimeB} ${partida.timeB.nome}`}</CardHeader>
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
										{users.map((user, idx) => (
											<tr key={user.palpites[partida.order]._id} className='gridPalpites'>
												<td className='text-center'>{idx + 1}</td>
												<td>{user.name}</td>
												<td className='text-center' style={{ justifySelf: 'center' }}>
													<div key={user.palpites[partida.order]._id + idx} className='rodadaPalpites'>
														<div className='bandeiraTimeA'>
															<i className={`bandeiraTimeA flag-icon flag-icon-${user.palpites[partida.order].partida.timeA.bandeira}`} />
														</div>
														<div className='palpiteTimeA'>
															{user.palpites[partida.order].placarTimeA}
														</div>
														<div className='divisorPalpite'>x</div>
														<div className='palpiteTimeB'>
															{user.palpites[partida.order].placarTimeB}
														</div>
														<div className='bandeiraTimeB'>
															<i className={`bandeiraTimeB flag-icon flag-icon-${user.palpites[partida.order].partida.timeB.bandeira}`} />
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

const mapStateToProps = state => ({ users: state.userStore.users, partidas: state.partidaStore.partidas, fases: state.faseStore.fases })
const mapDispatchToProps = dispatch => bindActionCreators({ search, searchPartidas }, dispatch)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Palpite))