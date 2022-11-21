import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Card, CardHeader, CardBody, Table, CustomInput, Row } from 'reactstrap'
import { Line } from 'react-chartjs-2';

import { searchAtivos, select } from '../user/userActions'

import If from '../../components/if'
import blankavatar from '../../assets/img/blankavatar.svg'
import duck from '../../assets/img/duck.svg'

const colors = [
	'rgb(54, 162, 235)',
	'rgb(75, 192, 192)',
	'rgb(201, 203, 207)',
	'rgb(255, 159, 64)',
	'rgb(153, 102, 255)',
	'rgb(255, 99, 132)',
	'rgb(255, 205, 86)'
]

const chartClassificacaoData = {
	labels: [],
	datasets: []
}

const chartLineOpts = (display, step) => ({
	legend: {
		display: display,
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
				stepSize: step
			},
		}],
	}
});

class Disputa extends Component {
	componentWillMount() {
		this.props.searchAtivos()
	}
	handleChange = event => {
		if (event.target.value) {
			const user = this.props.users.find(u => u._id === event.target.value)
			this.props.select(user)
		}
	}
	encontrarUltimaPartida = () => {
		let ultimaPartida
		this.props.partidas.forEach(partida => {
			if (partida.placarTimeA >= 0 && partida.placarTimeB >= 0) {
				ultimaPartida = partida.order
			}
		});
		return ultimaPartida
	}
	montarGraficoClassificacaoGeral = () => {
		chartClassificacaoData.labels = []
		chartClassificacaoData.datasets = []
		const ultimaPartida = this.encontrarUltimaPartida()
		const chartUsers = [this.props.authenticatedUser, this.props.user]
		for (let i = 0; i < chartUsers.length; i++) {
			const user = chartUsers[i]
			let data = []
			if (user) {
				chartClassificacaoData.datasets.push({
					data,
					label: user.name,
					fill: false,
					backgroundColor: colors[i % colors.length],
					borderColor: colors[i % colors.length],
					borderWidth: 2,
					pointBorderColor: colors[i % colors.length],
					pointBackgroundColor: colors[i % colors.length],
					pointBorderWidth: 2,
					pointHoverBackgroundColor: colors[i % colors.length],
					pointHoverBorderColor: colors[i % colors.length],
					pointHoverBorderWidth: 2,
					pointRadius: 2,
				})
				if (user.palpites) {
					let palpites = user.palpites.filter(palpite => palpite.partida.order <= ultimaPartida)
					palpites = palpites.slice(Math.max(palpites.length - 10, 0))
					for (let j = 0; j < palpites.length; j++) {
						if (i === 0) {
							chartClassificacaoData.labels.push(`${palpites[j].partida.timeA.sigla} x ${palpites[j].partida.timeB.sigla}`)
						}
						data.push(palpites[j].classificacao)
					}
				}
			}
		}
		return chartClassificacaoData
	}
	render() {
		const { user, users, authenticatedUser } = this.props
		const ultimaClassificacao = users.reduce((ult, user) => user.classificacao > ult ? user.classificacao : ult, 0)
		return (
			<div style={{ backgroundColor: 'white' }}>
				<Card style={{ marginBottom: '0px' }}>
					<CardHeader className='d-flex align-items-center justify-content-between'>
						<span>Disputar com:</span>
						<div>
							<CustomInput id='usuario' name='usuario' type='select' value={user ? user._id : undefined} onChange={this.handleChange}>
								<option value={undefined}>Selecione um participante</option>
								{users.filter(u => u._id !== authenticatedUser._id).map(u => (
									<option key={u._id} value={u._id}>{u.name}</option>
								))}
							</CustomInput>
						</div>
					</CardHeader>
					<CardBody style={{ padding: '0px' }}>
						<div className='col-sx-12 col-sm-12 col-md-12 col-lg-12 col-xl-12'>
							<p className='text-center placarClassificacao' style={{padding: '5px', marginBottom: '0px'}}>Funcionalidade em fase de testes</p>
						</div>
						<If test={this.props.user !== undefined && this.props.user !== null}>
							<Row>
								<div className='col-sx-12 col-sm-12 col-md-12 col-lg-12 col-xl-12'>
									<Card>
										<CardBody>
											<div style={{ borderRadius: '8px', overflow: 'hidden', backgroundImage: 'linear-gradient(to right,  rgba(224,224,224,1) 0%,rgba(255,255,255,1) 50%,rgba(224,224,224,1) 100%)'}}>
												<Table responsive borderless>
													<tbody>
														<tr>
															<td style={{verticalAlign: 'middle', textAlign: 'center', width: '100px'}}><img alt='avatar' src={authenticatedUser.picture} className='img-avatar' width={75} height={75} /></td>
															<td className='d-flex justify-content-center'>
																<table style={{width: '100%', padding: '10px'}}>
																	<tbody>
																		<tr>
																			<td colSpan={5} className='text-center text-muted' style={{padding: '0px', fontSize: '12px', fontStyle: 'italic'}}>Classificação</td>
																		</tr>
																		<tr>
																			<td className='text-center' style={{width: '22px', padding: '2px'}}>
																				<If test={authenticatedUser.classificacao > 0 && authenticatedUser.classificacao < 4}>
																					<i className={`fas fa-trophy ${authenticatedUser.classificacao === 1 ? 'goldTrophy' : authenticatedUser.classificacao === 2 ? 'silverTrophy' : 'bronzeTrophy'}`}></i>
																				</If>
																				<If test={authenticatedUser.classificacao > 3 && authenticatedUser.classificacao === ultimaClassificacao}>
																					<img src={duck} alt='duck' width={16} height={16} />
																				</If>
																			</td>
																			<td className='text-right placarClassificacao' style={{padding: '2px'}}>{authenticatedUser.classificacao}</td>
																			<td style={{width: '50px'}}></td>
																			<td className='text-left placarClassificacao' style={{padding: '2px'}}>{user ? user.classificacao: 0}</td>
																			<td className='text-center' style={{width: '22px', padding: '2px'}}>
																				<If test={user && user.classificacao > 0 && user.classificacao < 4}>
																					<i className={`fas fa-trophy ${user ? (user.classificacao === 1 ? 'goldTrophy' : user.classificacao === 2 ? 'silverTrophy' : 'bronzeTrophy') : ''}`}></i>
																				</If>
																				<If test={user && user.classificacao > 3 && user.classificacao === ultimaClassificacao}>
																					<img src={duck} alt='duck' width={16} height={16} />
																				</If>
																			</td>
																		</tr>
																		<tr>
																			<td style={{width: '22px'}}></td>
																			<td className='text-right placarClassificacao' style={{padding: '2px'}}>{authenticatedUser.totalAcumulado}</td>
																			<td style={{width: '50px'}}></td>
																			<td className='text-left placarClassificacao' style={{padding: '2px'}}>{user ? user.totalAcumulado: 0}</td>
																			<td style={{width: '22px'}}></td>
																		</tr>
																		<tr>
																			<td colSpan={5} className='text-center text-muted' style={{padding: '0px', fontSize: '12px', fontStyle: 'italic'}}>Pontuação</td>
																		</tr>
																	</tbody>
																</table>
															</td>
															<td style={{verticalAlign: 'middle', textAlign: 'center', width: '100px'}}><img alt='avatar' src={user ? user.picture : blankavatar} className='img-avatar' width={75} height={75} /></td>
														</tr>
													</tbody>
												</Table>
											</div>	
										</CardBody>
									</Card>
								</div>
							</Row>
                        	<Row>
								<div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
									<Card>
										<CardBody>
											<div className='col-sm-12 mb-3'>
                                            	<h5 className='mb-0 card-title'>Pontuação</h5>
                                            	<div className='small'>Estatísticas gerais</div>
                                        	</div>
											<div style={{ height: '310px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)'}}>
												<Table responsive striped borderless>
													<thead>
														<tr>
															<th className='text-center'></th>
															<th className='text-right' style={{ verticalAlign: 'middle' }}>Pontuação por tipo</th>
															<th className='text-center'><img alt='avatar' src={authenticatedUser.picture} className='img-avatar' width={35} height={35} /></th>
															<th className='text-center'><img alt='avatar' src={user ? user.picture : blankavatar} className='img-avatar' width={35} height={35} /></th>
														</tr>
													</thead>
													<tbody>
														<tr>
															<td className='d-flex justify-content-center classificacaoHeaderTD'><div className='classificacaoHeader' style={{ backgroundColor: 'rgb(54, 162, 235)' }}></div></td>
															<td className='text-right'>Placar cheio</td>
															<td className='text-center placarClassificacao'>{authenticatedUser.placarCheio}</td>
															<td className='text-center placarClassificacao'>{user ? user.placarCheio : ''}</td>
														</tr>
														<tr>
															<td className='d-flex justify-content-center classificacaoHeaderTD'><div className='classificacaoHeader' style={{ backgroundColor: 'rgb(75, 192, 192)' }}></div></td>
															<td className='text-right'>Placar time vencedor c/ gol</td>
															<td className='text-center placarClassificacao'>{authenticatedUser.placarTimeVencedorComGol}</td>
															<td className='text-center placarClassificacao'>{user ? user.placarTimeVencedorComGol : ''}</td>
														</tr>
														<tr>
															<td className='d-flex justify-content-center classificacaoHeaderTD'><div className='classificacaoHeader' style={{ backgroundColor: 'rgb(255, 159, 64)' }}></div></td>
															<td className='text-right'>Placar time vencedor</td>
															<td className='text-center placarClassificacao'>{authenticatedUser.placarTimeVencedor}</td>
															<td className='text-center placarClassificacao'>{user ? user.placarTimeVencedor : ''}</td>
														</tr>
														<tr>
															<td className='d-flex justify-content-center classificacaoHeaderTD'><div className='classificacaoHeader' style={{ backgroundColor: 'rgb(255, 205, 86)' }}></div></td>
															<td className='text-right'>Placar Gol</td>
															<td className='text-center placarClassificacao'>{authenticatedUser.placarGol}</td>
															<td className='text-center placarClassificacao'>{user ? user.placarGol : ''}</td>
														</tr>
														<tr>
															<td className='d-flex justify-content-center classificacaoHeaderTD'><div className='classificacaoHeader' style={{ backgroundColor: 'rgb(115,129,143)' }}></div></td>
															<td className='text-right'>Total acumulado</td>
															<td className='text-center placarClassificacao'>{authenticatedUser.totalAcumulado}</td>
															<td className='text-center placarClassificacao'>{user ? user.totalAcumulado : ''}</td>
														</tr>
													</tbody>
												</Table>
											</div>
										</CardBody>
									</Card>
								</div>
                                <div className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-6'>
                                    <Card>
                                        <CardBody>
                                            <div className='col-sm-12 mb-3'>
                                                <h5 className='mb-0 card-title'>Classificação</h5>
                                                <div className='small'>Histórico de classificações</div>
                                            </div>
                                            <div style={{ height: '310px', padding: '5px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)'}}>
                                                <Line data={this.montarGraficoClassificacaoGeral()} options={chartLineOpts(true)} height={200} />
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>
	                        </Row>
						</If>
					</CardBody>
				</Card>
			</div>
		)
	}
}

const mapStateToProps = state => ({ user: state.userStore.user, users: state.userStore.users, partidas: state.partidaStore.partidas })
const mapDispatchToProps = dispatch => bindActionCreators({ searchAtivos, select }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Disputa)