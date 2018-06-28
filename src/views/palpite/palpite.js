import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment'

import { Card, CardHeader, CardBody, Button } from 'reactstrap'
import { toast } from "react-toastify";

import { search } from '../fase/faseActions'
import { montarGrupos, handleChange, updateAll } from './palpiteActions'
import If from '../../components/if'

class Palpite extends Component {
	constructor(props) {
		super(props)
		this.state = { tabIndex: 0 }
		this.inputTabIndex = []
	}
	componentWillMount() {
		const user = this.props.getAuthenticatedUser()
		this.props.search(this.props.faseId)
		this.props.montarGrupos(user._id, this.props.faseId)
	}
	componentDidUpdate() {
		this.focus()
	}
	handleKeyDown = (event, palpite) => {
		const name = event.target.name;
		const tabIndex = event.target.tabIndex
		if (event.key === 'Backspace') {
			if (event.target.value === '') {
				if (tabIndex > 0) {
					palpite[name] = null
					this.props.handleChange(palpite, this.props.grupos)
					this.setState({ tabIndex: tabIndex - 1 })
					event.preventDefault()
				}
			}
		}
	}
	handleChange = (event, palpite) => {
		event.preventDefault()
		const name = event.target.name;
		const tabIndex = event.target.tabIndex
		let value = event.target.value
		if (value === '0' || value === '1' || value === '2' || value === '3' || value === '4' || value === '5' || value === '6' || value === '7' || value === '8' || value === '9' || value === '' || value === null || value === undefined) {
			value = (value === '' || value === undefined) ? null : value
			palpite[name] = value
			this.props.handleChange(palpite, this.props.grupos)
			if (value !== null) {
				this.setState({ tabIndex: tabIndex + 1 })
			} else {
				this.setState({ tabIndex: tabIndex })
			}
		}
	}
	handleClick = event => {
		event.preventDefault()
		let palpites = []
		this.props.grupos.forEach(grupo => {
			grupo.rodadas.forEach(rodada => {
				rodada.palpites.forEach(palpite => {
					palpites.push(palpite)
				})
			})
		});
		const user = this.props.getAuthenticatedUser()
		this.props.updateAll(palpites, user._id, this.props.faseId)
		toast.success('Seus palpites foram salvos, agora é só torcer!');
	}
	focus() {
		if (this.inputTabIndex[this.state.tabIndex]) {
			this.inputTabIndex[this.state.tabIndex].focus()
		}
	}
	render() {
		let inputIndex = 0
		let tabIndex = 0
		const grupos = this.props.grupos
		return (
			<div className='row'>
				<form style={{ width: '100%', height: '100%', display: 'contents' }}>
					<div className='col-12'>
						<Card>
							<CardHeader>
								Preencha seus palpites e boa sorte!
								<If test={this.props.fase.status === 'A'}>
									<Button size='sm' color='success' className='float-right' onClick={this.handleClick}>
										<i className='fas fa-save'></i>  Salvar
									</Button>
								</If>
							</CardHeader>
							<CardBody className='p-0'>
								<div className='row' style={{ margin: '0px' }}>
									{grupos.map((grupo, idx) => {
										return (
											<div key={idx} className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-4' style={{ padding: '0px' }}>
												<Card className='card-grupos'>
													<If test={grupo.nome !== 'SEM GRUPO'}>
														<CardHeader className='text-center bg-light-blue text-white nomeGrupo'>{grupo.nome}</CardHeader>
													</If>
													<CardBody className='card-body-grupos'>
														{grupo.rodadas.map((rodada, idx2) => {
															return (
																<div key={idx2}>
																	<If test={rodada.nome !== 'SEM RODADA'}>
																		<div className='text-center bg-gray-200 nomeRodada'><strong>{rodada.nome}</strong></div>
																	</If>
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
																					<input name='placarTimeA' type='text' className='palpiteTimeA form-control' maxLength='1' disabled={this.props.fase.status !== 'A'} tabIndex={tabIndex++} ref={input => { this.inputTabIndex[inputIndex++] = input }} value={palpite.placarTimeA} onKeyDown={e => this.handleKeyDown(e, palpite)} onChange={e => this.handleChange(e, palpite)} />
																				</div>
																				<div className='divisorPalpite'>x</div>
																				<div className='palpiteTimeB'>
																					<input name='placarTimeB' type='text' className='palpiteTimeB form-control' maxLength='1' disabled={this.props.fase.status !== 'A'} tabIndex={tabIndex++} ref={input => { this.inputTabIndex[inputIndex++] = input }} value={palpite.placarTimeB} onKeyDown={e => this.handleKeyDown(e, palpite)} onChange={e => this.handleChange(e, palpite)} />
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

const mapStateToProps = (state, ownProps) => ({ grupos: state.palpiteStore.grupos, fase: state.faseStore.fase, faseId: ownProps.match.params.fase })
const mapDispatchToProps = dispatch => bindActionCreators({ montarGrupos, handleChange, updateAll, search }, dispatch)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Palpite))