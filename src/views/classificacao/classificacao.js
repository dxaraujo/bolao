import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Card, CardHeader, CardBody, Table, CustomInput } from 'reactstrap'

import If from '../../components/if'
import { search } from '../user/userActions'
import { search as searchPartidas } from '../partida/partidaActions'

import blackAvatar from '../../assets/img/blankavatar.svg'
import duck from '../../assets/img/duck.svg'
import { backendURI } from '../../config'

class Classificacao extends Component {
	constructor(props) {
		super(props)
		this.state = { users: [], partidaOrder: 0 }
	}
	componentWillMount() {
		this.props.search()
		this.props.searchPartidas()
	}
	componentWillReceiveProps(nextProps) {
		if (this.props.partidas.length !== nextProps.partidas.length || this.props.users.length !== nextProps.users.length) {
			if (nextProps.partidas.length > 0 && nextProps.users.length > 0) {
				const partidaOrder = this.encontrarUltimaClassificacao(nextProps.partidas)
				const users = this.montarClassificacoes(nextProps.users, partidaOrder)
				this.setState({ partidaOrder, users })
			}
		}
	}
	mudancaClassificacao(user) {
		console.log(user.classificacaoAnterior)
		if (user.classificacaoAnterior) {
			const r = user.classificacaoAnterior - user.classificacao
			if (r === 0) {
				return 'classificacaoIgual'
			} if (r > 0) {
				return 'classificacao_up'
			} else {
				return 'classificacao_down'
			}
		} else {
			return 'classificacaoIgual'
		}
	}
	resultadoMudancaClassificacao(user) {
		console.log(user.classificacaoAnterior)
		if (user.classificacaoAnterior) {
			const r = user.classificacaoAnterior - user.classificacao
			if (r === 0) {
				return ''
			} else {
				return r
			}
		} else {
			return ''
		}
	}
	montarClassificacoes(users, partidaOrder) {
		for (let i = 0; i < users.length; i++) {
			users[i] = { ...users[i] }
			const user = users[i]
			console.log('User.name:', user.name)
			user.classificacao = user.palpites[partidaOrder].classificacao
			console.log('User.classificacao:', user.classificacao)
			user.classificacaoAnterior = user.palpites[partidaOrder].classificacaoAnterior
			console.log('User.classificacaoAnterior:', user.classificacaoAnterior)
			user.totalAcumulado = user.palpites[partidaOrder].totalAcumulado
			console.log('User.totalAcumulado:', user.totalAcumulado)
			user.placarCheio = 0
			user.placarTimeVencedorComGol = 0
			user.placarTimeVencedor = 0
			user.placarGol = 0
			for (let j = 0; j <= partidaOrder; j++) {
				user.placarCheio += user.palpites[j].placarCheio ? 1 : 0
				user.placarTimeVencedorComGol += user.palpites[j].placarTimeVencedorComGol
				user.placarTimeVencedor += user.palpites[j].placarTimeVencedor ? 1 : 0
				user.placarGol += user.palpites[j].placarGol ? 1 : 0
			}
		}
		const newUsers = users.sort((u1, u2) => u1.classificacao - u2.classificacao)
		return newUsers
	}
	encontrarUltimaClassificacao(partidas) {
		let ultimaClassificacao
		partidas.forEach(partida => {
			if (partida.placarTimeA >= 0 && partida.placarTimeB >= 0) {
				ultimaClassificacao = partida.order
			}
		});
		return ultimaClassificacao
	}
	handleChange = event => {
		const partidaOrder = event.target.value
		const users = this.montarClassificacoes(this.state.users, partidaOrder)
		this.setState({ partidaOrder, users })
	}
	render() {
		const users = this.state.users
		const ultimaClassificacao = users.reduce((ult, user) => user.classificacao > ult ? user.classificacao : ult, 0)
		return (
			<div style={{ backgroundColor: 'white' }}>
				<Card style={{ marginBottom: '0px' }}>
					<CardHeader className='d-flex align-items-center justify-content-between'>
						<span>Classificação</span>
						<div>
							<CustomInput id='partida' name='partida' type='select' value={this.state.partidaOrder || 0} onChange={this.handleChange}>
								{this.props.partidas.filter(partida => partida.placarTimeA >= 0 && partida.placarTimeB >= 0).map(partida => (
									<option key={partida._id} value={partida.order}>{`${partida.timeA.nome} x ${partida.timeB.nome}`}</option>
								))}
							</CustomInput>
						</div>
					</CardHeader>
					<div className='divplayers'>
						<div style={{ justifySelf: 'right', alignSelf: 'top' }}>
							<img alt='avatar' src={users[1] ? `${backendURI}/avatar/${users[1]._id}` : blackAvatar} className='player2' width={50} height={50} />
						</div>
						<div style={{ justifySelf: 'center', alignSelf: 'top' }}>
							<img alt='avatar' src={users[0] ? `${backendURI}/avatar/${users[0]._id}` : blackAvatar} className='player1' width={50} height={50} />
						</div>
						<div style={{ justifySelf: 'left', alignSelf: 'top' }}>
							<img alt='avatar' src={users[2] ? `${backendURI}/avatar/${users[2]._id}` : blackAvatar} className='player3' width={50} height={50} />
						</div>
					</div>
					<CardBody style={{ padding: '0px' }}>
						<Table responsive striped borderless>
							<thead>
								<tr className='gridClassificacao'>
									<th className='text-right'>#</th>
									<th className='text-center'></th>
									<th className='text-center'></th>
									<th>Nome</th>
									<th className='text-center'></th>
									<th className='d-flex justify-content-center classificacaoHeaderTD'><div className='classificacaoHeader' style={{ backgroundColor: 'rgb(115,129,143)' }}></div></th>
									<th className='d-flex justify-content-center classificacaoHeaderTD'><div className='classificacaoHeader' style={{ backgroundColor: 'rgb(75, 192, 192)' }}></div></th>
									<th className='d-flex justify-content-center classificacaoHeaderTD'><div className='classificacaoHeader' style={{ backgroundColor: 'rgb(54, 162, 235)' }}></div></th>
									<th className='d-flex justify-content-center classificacaoHeaderTD'><div className='classificacaoHeader' style={{ backgroundColor: 'rgb(255, 205, 86)' }}></div></th>
									<th className='d-flex justify-content-center classificacaoHeaderTD'><div className='classificacaoHeader' style={{ backgroundColor: 'rgb(255, 159, 64)' }}></div></th>
								</tr>
							</thead>
							<tbody>
								{users.map((user, idx) => {
									return (
										<tr key={user.classificacao + '-' + idx} className='gridClassificacao'>
											<td className='text-right placarClassificacao'>{user.classificacao || '-'}</td>
											<td className='text-center'>
												<If test={user.classificacao > 0 && user.classificacao < 4}>
													<i className={`fas fa-trophy ${user.classificacao === 1 ? 'goldTrophy' : user.classificacao === 2 ? 'silverTrophy' : 'bronzeTrophy'}`}></i>
												</If>
												<If test={user.classificacao > 3 && user.classificacao === ultimaClassificacao}>
													<img src={duck} alt='duck' width={16} height={16} />
												</If>
											</td>
											<td className='text-center'>
												<img alt='avatar' src={`${backendURI}/avatar/${user._id}`} className='img-avatar' width={50} height={50} />
											</td>
											<td>{user.name}</td>
											<td className={`text-center classificacao ${this.mudancaClassificacao(user)}`}>{this.resultadoMudancaClassificacao(user)} </td>
											<td className='text-center placarClassificacao'>{user.totalAcumulado}</td>
											<td className='text-center text-muted'>{user.placarCheio}</td>
											<td className='text-center text-muted'>{user.placarTimeVencedorComGol}</td>
											<td className='text-center text-muted'>{user.placarTimeVencedor}</td>
											<td className='text-center text-muted'>{user.placarGol}</td>
										</tr>
									)
								})}
							</tbody>
						</Table>
					</CardBody>
				</Card>
				<Card>
					<CardHeader>Legenda</CardHeader>
					<CardBody style={{ padding: '0px' }}>
						<Table responsive striped borderless>
							<tbody>
								<tr className='gridLegenda'>
									<td className='d-flex justify-content-center'><div style={{ margin: '2px', borderRadius: '10px', backgroundColor: 'rgb(115,129,143)', width: '20px', height: '20px' }}></div></td>
									<td>Pontuação total</td>
								</tr>
								<tr className='gridLegenda'>
									<td className='d-flex justify-content-center'><div style={{ margin: '2px', borderRadius: '10px', backgroundColor: 'rgb(75, 192, 192)', width: '20px', height: '20px' }}></div></td>
									<td>
										Placar Exato<br />
										<span className='small text-muted'>Ex: Palpite 2 x 1 e resultado 2 x 1, acertou o placar exato</span>
									</td>
								</tr>
								<tr className='gridLegenda'>
									<td className='d-flex justify-content-center'><div style={{ margin: '2px', borderRadius: '10px', backgroundColor: 'rgb(54, 162, 235)', width: '20px', height: '20px' }}></div></td>
									<td>
										Resultado mais gol<br />
										<span className='small text-muted'>Ex: Palpite 2 x 1 e resultado 2 x 0, acertou time ganhador / empate e o número de gols de um dos time</span>
									</td>
								</tr>
								<tr className='gridLegenda'>
									<td className='d-flex justify-content-center'><div style={{ margin: '2px', borderRadius: '10px', backgroundColor: 'rgb(255, 205, 86)', width: '20px', height: '20px' }}></div></td>
									<td>
										Somente resultado<br />
										<span className='small text-muted'>Ex: Palpite 2 x 1 e resultado 3 x 2, acertou somente time ganhador / empate</span>
									</td>
								</tr>
								<tr className='gridLegenda'>
									<td className='d-flex justify-content-center'><div style={{ margin: '2px', borderRadius: '10px', backgroundColor: 'rgb(255, 159, 64)', width: '20px', height: '20px' }}></div></td>
									<td>
										Somente gol<br />
										<span className='small text-muted'>Ex: Palpite 2 x 1 e resultado 2 x 0, acertou somente o número de gols de um dos time</span>
									</td>
								</tr>
							</tbody>
						</Table>
					</CardBody>
				</Card>
			</div>
		)
	}
}

const mapStateToProps = state => ({ users: state.userStore.users, partidas: state.partidaStore.partidas })
const mapDispatchToProps = dispatch => bindActionCreators({ search, searchPartidas }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Classificacao)