import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment'

import { Card, CardHeader, CardBody, Input, Button } from 'reactstrap'

import { montarGrupos, handleChange, updateAll } from './palpiteActions'

class Palpite extends Component {
	componentWillMount() {
		const user = this.props.getAuthenticatedUser()
		this.props.montarGrupos(user._id, this.props.fase)
	}
	handleKeyDown = (event, palpite) => {
		const name = event.target.name;
		const form = event.target.form;
		const index = Array.prototype.indexOf.call(form, event.target);
		if (event.key === 'Backspace') {
			if (event.target.value === '') {
				event.preventDefault()
				if (index > 1) {
					this.props.handleChange(name, '', palpite, this.props.grupos)
					form.elements[index - 1].focus();
				}
			}
		}
	}
	handleChange = (event, palpite) => {
		event.preventDefault()
		const value = event.target.value
		if (value === '0' || value === '1' ||
			value === '2' || value === '3' ||
			value === '4' || value === '5' ||
			value === '6' || value === '7' ||
			value === '8' || value === '9' ||
			value === '' || value === null || value === undefined) {
			this.props.handleChange(event.target.name, value, palpite)
			if (value !== '') {
				const form = event.target.form;
				const index = Array.prototype.indexOf.call(form, event.target);
				form.elements[index + 1].focus();
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
		console.log('chamou')
		const user = this.props.getAuthenticatedUser()
		this.props.updateAll(palpites, user._id, this.props.fase)
	}
	render() {
		const grupos = this.props.grupos
		return (
			<div className='row'>
				<form style={{width: '100%', height: '100%', display: 'contents'}}>
					{grupos.map((grupo, idx) => {
						return (
							<div key={idx} className='col-sm-12 col-md-6 col-lg-4'>
								<Card>
									<CardHeader className='text-center bg-light-blue text-white h5'>
										{grupo.nome}
										<Button size='sm' color='success' className='float-right' onClick={this.handleClick}>
											<i className='fas fa-save'></i>  Salvar
										</Button>
									</CardHeader>
									<CardBody className='card-body-grupos'>
										{grupo.rodadas.map((rodada, idx2) => {
											return (
												<div key={idx2}>
													<div className='text-center bg-gray-200'><strong>{rodada.nome}</strong></div>
													{rodada.palpites.map((palpite, idx3) => {
														return (
															<div key={idx3} className='bg-gray-100 rodada'>
																<div className='nomeTimeA'>
																	<span className='h6'>{palpite.partida.timeA.nome}</span>
																</div>
																<div className='bandeiraTimeA'>
																	<i className={`bandeiraTimeA flag-icon flag-icon-${palpite.partida.timeA.bandeira} h3`} />
																</div>
																<div className='palpiteTimeA'>
																	<Input name='placarTimeA' type='text' className='palpiteTimeA' maxLength='1' value={palpite.placarTimeA} onKeyDown={e => this.handleKeyDown(e, palpite)} onChange={e => this.handleChange(e, palpite)} />
																</div>
																<div className='divisorPalpite'>x</div>
																<div className='palpiteTimeB'>
																	<Input name='placarTimeB' type='text' className='palpiteTimeB' maxLength='1' value={palpite.placarTimeB} onKeyDown={e => this.handleKeyDown(e, palpite)} onChange={e => this.handleChange(e, palpite)} />
																</div>
																<div className='bandeiraTimeB'>
																	<i className={`bandeiraTimeB flag-icon flag-icon-${palpite.partida.timeB.bandeira} h3`} />
																</div>
																<div className='nomeTimeB'>
																	<span className='h6'>{palpite.partida.timeB.nome}</span>
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
				</form>
			</div>
		)
	}
}

const mapStateToProps = (state, ownProps) => ({ grupos: state.palpiteStore.grupos, fase: ownProps.match.params.fase })
const mapDispatchToProps = dispatch => bindActionCreators({ montarGrupos, handleChange, updateAll }, dispatch)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Palpite))