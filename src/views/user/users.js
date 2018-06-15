import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Card, CardHeader, CardBody, Table } from 'reactstrap'
import { toast } from "react-toastify";

import UserForm from './userForm'
import { search, update } from './userActions'

class Users extends Component {
	componentWillMount() {
		this.props.search()
	}
	update = (user) => {
		this.props.update(user)
		toast.success('Usuário atualizado com sucesso, as alterações entraram em vigor no próximo login');
	}
	render() {
		const users = this.props.users
		return (
			<Card>
				<CardHeader>
					Lista de Usuários
				</CardHeader>
				<CardBody style={{ padding: '0px' }}>
					<Table responsive striped borderless>
						<thead>
							<tr className='gridUsers'>
								<th className='text-center'>#</th>
								<th></th>
								<th>Nome</th>
								<th className='text-center'>Admin</th>
								<th className='text-center'></th>
							</tr>
						</thead>
						<tbody>
							{users.map((user, idx) => (<UserForm key={user._id} index={idx} user={user} update={this.update} />))}
						</tbody>
					</Table>
				</CardBody>
			</Card>
		)
	}
}

const mapStateToProps = state => ({ users: state.userStore.users })
const mapDispatchToProps = dispatch => bindActionCreators({ search, update }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Users)