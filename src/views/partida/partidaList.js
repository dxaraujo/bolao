import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Card, CardHeader, CardBody, Table, ButtonGroup, Button } from 'reactstrap'
import Swal from 'sweetalert2'

import If from '../../components/if';
import { rootUser } from '../../config'
import { search as searchTimes } from '../time/timeActions'
import { search, select, remove } from './partidaActions'

class PartidaList extends Component {

	componentWillMount() {
		this.props.searchTimes()
		this.props.search()
	}

	search = () => {
		this.props.search()
	}

	create = () => {
		this.props.history.push('/partida/create')
	}

	update = partida => {
		this.props.select(partida)
		this.props.history.push('/partida/update')
	}

	prepareDelete = partida => {
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

	delete = partida => {
		this.props.remove(partida);
	}

	render() {
		const user = this.props.authenticatedUser
		const partidas = this.props.partidas
		const desabilitado = (nomeFase) => {
			const fase = this.props.fases.find(f => f.nome === nomeFase)
			return fase.status === 'D'
		}
		return (
			<Card>
				<CardHeader>
					Lista de Partidas
					<If test={rootUser === user.email}>
						<Button color='success' size='sm' className='float-right mb-0' onClick={this.create}>
							<i className='fas fa-plus-circle'></i> Adicionar
						</Button>
					</If>
				</CardHeader>
				<CardBody style={{ padding: '0px' }}>
					<Table responsive striped borderless>
						<thead>
							<tr className='gridPartidas'>
								<th className='text-center'>Ordem</th>
								<th>Fase</th>
								<th>Grupo</th>
								<th>Rodada</th>
								<th>Data</th>
								<th>TimeA</th>
								<th>TimeB</th>
								<th className='text-center'></th>
							</tr>
						</thead>
						<tbody>
							{partidas.map((partida, idx) => {
								return (
									<tr key={idx} className='gridPartidas'>
										<td className='text-center'>{partida.order}</td>
										<td>{partida.fase}</td>
										<td>{partida.grupo}</td>
										<td>{partida.rodada}</td>
										<th>{partida.data}</th>
										<td>{partida.timeA ? partida.timeA.nome : ''}</td>
										<td>{partida.timeB ? partida.timeB.nome : ''}</td>
										<td className='text-center'>
											<If test={desabilitado(partida.fase)}>
												<ButtonGroup>
													<Button className='text-white' size='sm' color='warning' onClick={() => this.update(partida)}>
														<i className='fas fa-edit'></i>
													</Button>
													<If test={rootUser === user.email}>
														<Button size='sm' color='danger' onClick={() => this.prepareDelete(partida)}>
															<i className='fas fa-trash-alt'></i>
														</Button>
													</If>
												</ButtonGroup>
											</If>
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

const mapStateToProps = state => ({ partidas: state.partidaStore.partidas, times: state.timeStore.times, fases: state.faseStore.fases })
const mapDispatchToProps = dispatch => bindActionCreators({ search, select, remove, searchTimes }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(PartidaList)