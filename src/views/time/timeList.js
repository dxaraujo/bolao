import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Card, CardHeader, CardBody, Table, ButtonGroup, Button } from 'reactstrap'
import Swal from 'sweetalert2'

import { search, select, remove } from './timeActions'

class TimeList extends Component {
	constructor(props) {
		super(props)
		this.search = this.search.bind(this)
		this.create = this.create.bind(this)
		this.update = this.update.bind(this)
		this.delete = this.delete.bind(this)
		this.prepareDelete = this.prepareDelete.bind(this)
	}
	componentWillMount() {
		this.props.search()
	}
	search() {
		this.props.search()
	}
	create() {
		this.props.history.push('/time/create')
	}
	update(time) {
		this.props.select(time)
		this.props.history.push('/time/update')
	}
	prepareDelete(time) {
		Swal({
			title: 'Você tem certeza?',
			text: 'Depois de deletado, você não poderá recupear os dados!',
			type: 'warning',
			showConfirmButton: true,
			showCancelButton: true
		}).then((willDelete) => {
			if (willDelete.value) {
				this.delete(time)
			} else {
				Swal('A operação foi cancelada!', '', 'error');
			}
		});
	}
	delete(time) {
		this.props.remove(time);
	}
	render() {
		const times = this.props.times
		return (
			<Card>
				<CardHeader>
					Lista de Times
					<Button color='success' size='sm' className='float-right mb-0' onClick={this.create}>
						<i className='fas fa-plus-circle'></i> Adicionar
					</Button>
				</CardHeader>
				<CardBody style={{ padding: '0px' }}>
					<Table responsive striped borderless>
						<thead>
							<tr className='gridTime'>
								<th className='text-center'>#</th>
								<th>Nome</th>
								<th className='text-center'>Sigla</th>
								<th className='text-center'><i class="fas fa-flag text-secondary"></i></th>
								<th className='text-center'></th>
							</tr>
						</thead>
						<tbody>
							{times.map((time, idx) => {
								return (
									<tr key={idx} className='gridTime'>
										<td className='text-center'>{idx + 1}</td>
										<td>{time.nome}</td>
										<td className='text-center'>{time.sigla}</td>
										<td className='text-center'><i className={`flag-icon flag-icon-${time.bandeira} h4`} style={{ margin: '0px' }}></i></td>
										<td className='text-center'>
											<ButtonGroup>
												<Button size='sm' color='success' onClick={() => this.update(time)}>
													<i className='fas fa-edit'></i>
												</Button>
												<Button size='sm' color='danger' onClick={() => this.prepareDelete(time)}>
													<i className='fas fa-trash-alt'></i>
												</Button>
											</ButtonGroup>
										</td>
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

const mapStateToProps = state => ({ times: state.timeStore.times })
const mapDispatchToProps = dispatch => bindActionCreators({ search, select, remove }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(TimeList)