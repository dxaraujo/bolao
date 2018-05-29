import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment'

import { Card, CardHeader, CardBody, Input } from 'reactstrap'

import { montarGrupos } from './palpiteActions'

class Palpite extends Component {
	componentDidMount() {
		this.props.montarGrupos(this.props.fase)
	}
	render() {
		const grupos = this.props.grupos
		return (
			<div className='row'>
				{grupos.map((grupo, idx) => {
					return (
						<div key={idx} className='col-sm-6 col-md-4'>
							<Card style={{ borderRadius: '15px' }}>
								<CardHeader className='text-center bg-light-blue text-white h5' style={{ borderRadius: '15px 15px 0px 0px' }}>{grupo.nome}</CardHeader>
								<CardBody style={{ padding: '0px', borderRadius: '0px 0px 15px 15px' }}>
									{grupo.rodadas.map((rodada, idx2) => {
										return (
											<div key={idx2} style={{ borderRadius: '0px 0px 15px 15px' }}>
												<div className='text-center bg-gray-200'><strong>{rodada.nome}</strong></div>
												{rodada.partidas.map((partida, idx3) => {
													return (
														<div key={idx3} className='bg-gray-100 rodada' style={(rodada.partidas.length - 1) === idx3 ? { borderRadius: '0px 0px 15px 15px' } : {}}>
															<div className='nomeTimeA'>
																<span className='h6'>{partida.timeA.nome}</span>
															</div>
															<div className='bandeiraTimeA'>
																<i className={`bandeiraTimeA flag-icon flag-icon-${partida.timeA.bandeira} h3`} />
															</div>
															<div className='palpiteTimeA'>
																<Input type='text' className='palpiteTimeA' maxLength='1' />
															</div>
															<div className='divisorPalpite'>x</div>
															<div className='palpiteTimeB'>
																<Input type='text' className='palpiteTimeB' maxLength='1' />
															</div>
															<div className='bandeiraTimeB'>
																<i className={`bandeiraTimeB flag-icon flag-icon-${partida.timeB.bandeira} h3`} />
															</div>
															<div className='nomeTimeB'>
																<span className='h6'>{partida.timeB.nome}</span>
															</div>
															<div className='horaPartida'>
																<span className='horaPartida text-secundary'>{moment(partida.data, 'YYYY/MM/DD hh:mm a').format('DD/MM/YYYY HH:mm')}</span>
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
		)
	}
}

const mapStateToProps = (state, ownProps) => ({ grupos: state.palpiteStore.grupos, times: state.timeStore.times, partidas: state.partidaStore.partidas, fase: ownProps.match.params.fase })
const mapDispatchToProps = dispatch => bindActionCreators({ montarGrupos }, dispatch)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Palpite))