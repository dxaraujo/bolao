import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Card, CardHeader, CardBody, Table } from 'reactstrap'
import { toast } from "react-toastify";

import UserForm from './userForm'
import { search, update } from '../user/userActions'

class Users extends Component {
	constructor(props) {
		super(props)
		this.state = { users: [] }
		this.update = this.update.bind(this)
	}
	componentWillMount() {
		this.props.search()
	}
	componentWillReceiveProps(nextProps) {
		const antes = JSON.stringify(this.props.users)
		const depois = JSON.stringify(nextProps.users)
		if(!antes.valueOf () !== depois.valueOf()) {
			this.setState({users: nextProps.users})
		}
	}
	update(user) {
		this.props.update(user)
		toast.success('Usuário atualizado com sucesso, as alterações entraram em vigor no próximo login');
	}
	render() {
		const users = this.state.users
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
							{users.map((user, idx) => (<UserForm key={user.isAdmin} index={idx} user={user} update={this.update} />))}
						</tbody>
					</Table>
				</CardBody>
			</Card>
		)
	}
}

const mapStateToProps = state => ({ users: state.userStore.users, selectedUser: state.userStore.selectedUser })
const mapDispatchToProps = dispatch => bindActionCreators({ search, update }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Users)