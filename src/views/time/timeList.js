import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Card, CardHeader, CardBody, CardFooter, Table, ButtonGroup, Button } from 'reactstrap'
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
			<Card style={{ borderRadius: '15px' }}>
				<CardHeader style={{ borderRadius: '15px 15px 0px 0px' }}>Lista de Times</CardHeader>
				<CardBody style={{ padding: '0px' }}>
					<Table responsive striped borderless>
						<thead>
							<tr className='d-flex'>
								<th className='text-center col-1'>#</th>
								<th className='col-md-6 col-sm-5'>Nome</th>
								<th className='col-2'>Sigla</th>
								<th className='text-center col-2'>Bandeira</th>
								<th className='text-center col-md-1 col-sm-2'></th>
							</tr>
						</thead>
						<tbody>
							{times.map((time, idx) => {
								return (
									<tr key={idx} className='d-flex'>
										<td className='text-center col-1'>{idx + 1}</td>
										<td className='col-md-6 col-sm-5'>{time.nome}</td>
										<td className='col-2'>{time.sigla}</td>
										<td className='text-center col-2'><i className={`flag-icon flag-icon-${time.bandeira} h4`} style={{ margin: '0px' }}></i></td>
										<td className='text-center col-md-1 col-sm-2'>
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
				<CardFooter className='app-card-footer d-flex flex-row-reverse' style={{ borderRadius: '0px 0px 15px 15px' }}>
					<Button color='success' size='sm' onClick={this.create}>
						<i className='fas fa-plus-circle'></i> Adicionar
					</Button>
				</CardFooter>
			</Card>
		)
	}
}

const mapStateToProps = state => ({ times: state.timeStore.times })
const mapDispatchToProps = dispatch => bindActionCreators({ search, select, remove }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(TimeList)