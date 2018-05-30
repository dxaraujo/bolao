import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Card, CardBody, Table } from 'reactstrap'

import If from '../../components/if'
import { search } from '../user/userActions'

import blackAvatar from '../../assets/img/blankavatar.png'
import podium from '../../assets/img/podium.png'

class Classificacao extends Component {
	componentWillMount() {
		this.props.search()
	}
	render() {
		const users = this.props.users
		return (
			<Card>
				<CardBody style={{ padding: '0px' }}>
					<div className='divplayers'>
						<div style={{justifySelf: 'right', alignSelf: 'top'}}><img alt='avatar' src={users[1] ? users[1].avatar ? users[1].avatar : blackAvatar : blackAvatar } className='player2'/></div>
						<div style={{justifySelf: 'center', alignSelf: 'top'}}><img alt='avatar' src={users[0] ? users[0].avatar ? users[0].avatar : blackAvatar : blackAvatar } className='player1'/></div>
						<div style={{justifySelf: 'left', alignSelf: 'top'}}><img alt='avatar' src={users[2] ? users[2].avatar ? users[2].avatar : blackAvatar : blackAvatar } className='player3'/></div>
					</div>
					<Table responsive striped borderless>
						<thead>
							<tr className='gridUsers'>
								<th className='text-center'>#</th>
								<th className='text-center'></th>
								<th className='text-center'></th>
								<th>Nome</th>
								<th className='text-center'>Pontos</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user, idx) => {
								return (
									<tr key={idx} className='gridUsers'>
										<td className='text-center'>{idx + 1}</td>
										<td className='text-center'>
											<If test={idx < 3}>
												<i className={`fas fa-trophy fa-lg ${idx === 0 ? 'goldTrophy' : idx === 1 ? 'silverTrophy' : 'bronzeTrophy'}`}></i>
											</If>
										</td>
										<td className='text-center'>
											<img alt='avatar' src={user.avatar ? user.avatar : blackAvatar} className='img-avatar'/>
										</td>
										<td>{user.name}</td>
										<td className='text-center'>{user.pontuacao.total}</td>
									</tr>
								)
							})}
						</tbody>
					</Table>
				</CardBody>
			</Card>
		)
	}
}

const mapStateToProps = state => ({ users: state.userStore.users })
const mapDispatchToProps = dispatch => bindActionCreators({ search }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Classificacao)