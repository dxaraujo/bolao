import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Card, CardHeader, CardBody, Table } from 'reactstrap'
import { toast } from "react-toastify";

import FaseForm from './faseForm'
import { search, update } from './faseActions'

class Users extends Component {
	componentWillMount() {
		this.props.search()
	}
	update = (fase) => {
		this.props.update(fase)
		toast.success('Fase atualizada com sucesso!');
	}
	render() {
		const user = this.props.getAuthenticatedUser()
		const fases = this.props.fases
		return (
			<Card>
				<CardHeader>
					Fases da competição
				</CardHeader>
				<CardBody style={{ padding: '0px' }}>
					<Table responsive striped borderless>
						<thead>
							<tr className='gridFases'>
								<th className='text-center'>#</th>
								<th>Nome</th>
								<th className='text-center'>Status</th>
							</tr>
						</thead>
						<tbody>
							{fases.map((fase, idx) => (<FaseForm key={fase._id} index={idx} fase={fase} user={user} update={this.update} />))}
						</tbody>
					</Table>
				</CardBody>
			</Card>
		)
	}
}

const mapStateToProps = state => ({ fases: state.faseStore.fases })
const mapDispatchToProps = dispatch => bindActionCreators({ search, update }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Users)