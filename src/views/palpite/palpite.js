import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment'

import { Card, CardHeader, CardBody, Input, Button } from 'reactstrap'
import If from '../../components/if'

import { montarGrupos } from './palpiteActions'

class Palpite extends Component {
	componentWillMount() {
		const user = this.props.getAuthenticatedUser()
		this.props.montarGrupos(user._id, this.props.fase)
	}
	handleKeyDown = (event) => {
		if (event.key === 'Tab') {
			event.preventDefault();
			const form = event.target.form;
			const index = Array.prototype.indexOf.call(form, event.target);
			if (index < (form.elements.length - 1)) {
				form.elements[index + 1].focus();
			}
		}
		if (event.key === 'Backspace') {
			if (event.target.value === '') {
				event.preventDefault();
				const form = event.target.form;
				const index = Array.prototype.indexOf.call(form, event.target);
				if (index > 1) {
					form.elements[index - 1].focus();
				}
			}
		}
		if (event.key === '0' || event.key === '1' ||
			event.key === '2' || event.key === '3' ||
			event.key === '4' || event.key === '5' ||
			event.key === '6' || event.key === '7' ||
			event.key === '8' || event.key === '9') {
			if (event.target.value !== '') {
				event.preventDefault();
				const form = event.target.form;
				const index = Array.prototype.indexOf.call(form, event.target);
				form.elements[index + 1].value = event.key
				form.elements[index + 1].focus();
			}
		}
	}
	handleChange = (event, palpite) => {
		const value = event.target.value
		if (value != '0' && value != '1' &&
			value != '2' && value != '3' &&
			value != '4' && value != '5' &&
			value != '6' && value != '7' &&
			value != '8' && value != '9') {
			event.target.value = ''
		} else {
			console.log(palpite)
		}
	}
	render() {
		console.log(this.props.palpites)
		const palpites = this.props.grupos
		return (
			<div className='row'>
				<form>
					{palpites.map((grupo, idx) => {
						return (
							<div key={idx} className='col-sm-12 col-md-6 col-lg-4'>
								<Card>
									<CardHeader className='text-center bg-light-blue text-white h5'>
										{grupo.nome}
										<Button size='sm' color='success' className='float-right'>
											<i className='fas fa-plus-circle'></i>  Salvar
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
																	<Input name='timeA' type='text' className='palpiteTimeA' maxLength='1' value={palpite.placarTimeA} onKeyDown={this.handleKeyDown} onChange={(e) => this.handleChange(e, palpite)} />
																</div>
																<div className='divisorPalpite'>x</div>
																<div className='palpiteTimeB'>
																	<Input name='timeB' type='text' className='palpiteTimeB' maxLength='1' value={palpite.placarTimeB} onKeyDown={this.handleKeyDown} onChange={(e) => this.handleChange(e, palpite)} />
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
const mapDispatchToProps = dispatch => bindActionCreators({ montarGrupos }, dispatch)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Palpite))