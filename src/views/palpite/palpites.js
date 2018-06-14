import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment'

import { Card, CardHeader, CardBody, CustomInput } from 'reactstrap'

import { search as searchUsers } from '../user/userActions'
import { search as searchFases } from '../fase/faseActions'
import { search, montarGrupos, zerarGrupos } from './palpiteActions'
import If from '../../components/if'

class Palpite extends Component {
	constructor(props) {
		super(props)
		this.state = { user: '', fase: '' }
	}
	componentWillMount() {
		this.props.searchUsers()
		this.props.searchFases()
		this.props.zerarGrupos()
	}
	handleChange = event => {
		const value = event.target.value
		const name = event.target.name
		this.setState({ ...this.state, [name]: value }, state => {
			if (this.state.user !== '' && this.state.fase !== '') {
				this.props.montarGrupos(this.state.user, this.state.fase)
			} else {
				this.props.zerarGrupos()
			}
		})
	}
	render() {
		const grupos = this.props.grupos
		return (
			<div className='row'>
				<form style={{ width: '100%', height: '100%', display: 'contents' }}>
					<div className='col-12'>
						<Card>
							<CardHeader>
								Escolha o usuário e fase que você deseja ver os palpites
								<div className='float-right'>
									<CustomInput id='user' name='user' type='select' style={{ width: '200px', display: 'inline' }} value={this.state.user} onChange={this.handleChange}>
										<option value=''>Selecione um usuário</option>
										{this.props.users.map(user => (
											<option key={user._id} value={user._id}>{user.name}</option>
										))}
									</CustomInput>
									<CustomInput id='fase' name='fase' type='select' style={{ width: '200px', display: 'inline' }} value={this.state.fase} onChange={this.handleChange}>
										<option value=''>Selecione uma fase</option>
										{this.props.fases.map(fase => (
											<If key={fase.nome} test={fase.status === 'B'}>
												<option key={fase._id} value={fase.nome}>{fase.nome}</option>
											</If>
										))}
									</CustomInput>
								</div>
							</CardHeader>
							<CardBody className='p-0'>
								<div className='row' style={{ margin: '0px' }}>
									{grupos.map((grupo, idx) => {
										return (
											<div key={idx} className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-4' style={{ padding: '0px' }}>
												<Card className='card-grupos'>
													<CardHeader className='text-center bg-light-blue text-white nomeGrupo'>{grupo.nome}</CardHeader>
													<CardBody className='card-body-grupos'>
														{grupo.rodadas.map((rodada, idx2) => {
															return (
																<div key={idx2}>
																	<div className='text-center bg-gray-200 nomeRodada'><strong>{rodada.nome}</strong></div>
																	{rodada.palpites.map((palpite, idx3) => {
																		palpite.liberado = false;
																		return (
																			<div key={idx3 + '-' + palpite.placarTimeA + '-' + palpite.placarTimeB} className='bg-gray-100 rodada p-2'>
																				<div className='nomeTimeA'>
																					<span className='h6 nomeTimeA'>{palpite.partida.timeA.nome}</span>
																				</div>
																				<div className='bandeiraTimeA'>
																					<i className={`bandeiraTimeA flag-icon flag-icon-${palpite.partida.timeA.bandeira}`} />
																				</div>
																				<div className='palpiteTimeA'>
																					<input name='placarTimeA' type='text' className='palpiteTimeA form-control' maxLength='1' disabled={true} value={palpite.placarTimeA} />
																				</div>
																				<div className='divisorPalpite'>x</div>
																				<div className='palpiteTimeB'>
																					<input name='placarTimeB' type='text' className='palpiteTimeB form-control' maxLength='1' disabled={true} value={palpite.placarTimeB} />
																				</div>
																				<div className='bandeiraTimeB'>
																					<i className={`bandeiraTimeB flag-icon flag-icon-${palpite.partida.timeB.bandeira}`} />
																				</div>
																				<div className='nomeTimeB'>
																					<span className='h6 nomeTimeB'>{palpite.partida.timeB.nome}</span>
																				</div>
																				<div className='horaPartida'>
																					<span className='horaPartida text-secundary'>{moment(palpite.partida.data, 'YYYY/MM/DD hh:mm:ss').format('DD/MM/YYYY HH:mm')}</span>
																				</div>
																			</div>
																		)
																	})}
																</div>
															)
														})}
													</CardBody>
												</Card>
											</div>
										)
									})}
								</div>
							</CardBody>
						</Card>
					</div>
				</form>
			</div>
		)
	}
}

const mapStateToProps = (state, ownProps) => ({ grupos: state.palpiteStore.grupos, fases: state.faseStore.fases, users: state.userStore.users })
const mapDispatchToProps = dispatch => bindActionCreators({ search, montarGrupos, zerarGrupos, searchUsers, searchFases }, dispatch)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Palpite))