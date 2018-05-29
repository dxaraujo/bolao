import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Card, CardHeader, CardBody, CardFooter, Table, ButtonGroup, Button } from 'reactstrap'
import Swal from 'sweetalert2'

import { search as searchTimes } from '../time/timeActions'
import { search, select, remove } from './partidaActions'

class PartidaList extends Component {
	constructor(props) {
		super(props)
		this.search = this.search.bind(this)
		this.create = this.create.bind(this)
		this.update = this.update.bind(this)
		this.delete = this.delete.bind(this)
		this.prepareDelete = this.prepareDelete.bind(this)
		this.popularTime = this.popularTime.bind(this)
	}
	componentWillMount() {
		this.props.searchTimes()
		this.props.search()
	}
	search() {
		this.props.search()
	}
	create() {
		this.props.history.push('/partida/create')
	}
	update(partida) {
		this.props.select(partida)
		this.props.history.push('/partida/update')
	}
	prepareDelete(partida) {
		Swal({
			title: 'Você tem certeza?',
			text: 'Depois de deletado, você não poderá recupear os dados!',
			type: 'warning',
			showConfirmButton: true,
			showCancelButton: true
		}).then((willDelete) => {
			if (willDelete.value) {
				this.delete(partida)
			} else {
				Swal('A operação foi cancelada!', '', 'error');
			}
		});
	}
	delete(partida) {
		this.props.remove(partida);
	}
	popularTime(id) {
		let time = undefined
		time = this.props.times.find(time => {
			return time._id === id
		})
		return time ? time.nome : ''
	}
	render() {
		const partidas = this.props.partidas
		return (
			<Card style={{ borderRadius: '15px' }}>
				<CardHeader style={{ borderRadius: '15px 15px 0px 0px' }}>Lista de Partidas</CardHeader>
				<CardBody style={{ padding: '0px' }}>
					<Table responsive striped borderless>
						<thead>
							<tr className='d-flex'>
								<th className='text-center col-1'>#</th>
								<th className='col-2'>Fase</th>
								<th className='col-1'>Grupo</th>
								<th className='col-2'>rodada</th>
								<th className='col-2'>TimeA</th>
								<th className='col-2'>TimeB</th>
								<th className='text-center col-1'><i className='fas fa-check text-secondary'></i></th>
								<th className='text-center col-1'></th>
							</tr>
						</thead>
						<tbody>
							{partidas.map((partida, idx) => {
								return (
									<tr key={idx} className='d-flex'>
										<td className='text-center col-1'>{idx + 1}</td>
										<td className='col-2'>{partida.fase}</td>
										<td className='col-1'>{partida.grupo}</td>
										<td className='col-2'>{partida.rodada}</td>
										<td className='col-2'>{this.popularTime(partida.timeA)}</td>
										<td className='col-2'>{this.popularTime(partida.timeB)}</td>
										<td className='text-center col-1'><i className={`fas fa-check text-${partida.liberado ? 'success' : 'secondary'}`}></i></td>
										<td className='text-center col-1'>
											<ButtonGroup>
												<Button size='sm' color='success' onClick={() => this.update(partida)}>
													<i className='fas fa-edit'></i>
												</Button>
												<Button size='sm' color='danger' onClick={() => this.prepareDelete(partida)}>
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

const mapStateToProps = state => ({ partidas: state.partidaStore.partidas, times: state.timeStore.times })
const mapDispatchToProps = dispatch => bindActionCreators({ search, select, remove, searchTimes }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(PartidaList)