import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { toast } from "react-toastify";

import { Card, CardHeader, CardBody, Table } from 'reactstrap'

import ResultadoForm from './resultadoForm'
import { search as searchTimes } from '../time/timeActions'
import { searchResultado as search, updateResultado as update } from '../partida/partidaActions'

class Resultado extends Component {

	componentWillMount() {
		this.props.searchTimes()
		this.props.search()
	}

	update = (partida) => {
		this.props.update(partida)
		toast.success('Resultado atualizado com sucesso');
	}

	render() {
		const partidas = this.props.partidas
		return (
			<Card>
				<CardHeader>Resultados das Partidas</CardHeader>
				<CardBody style={{ padding: '0px' }}>
					<Table responsive striped borderless>
						<thead>
							<tr className='gridResultados'>
								<th className='text-center'>#</th>
								<th className='text-center'>Partida</th>
								<th className='text-center'></th>
							</tr>
						</thead>
						<tbody>
							{partidas.map((partida, idx) => (<ResultadoForm key={idx} index={idx} partida={partida} update={this.update} />))}
						</tbody>
					</Table>
				</CardBody>
			</Card>
		)
	}
}

const mapStateToProps = state => ({ partidas: state.partidaStore.partidas, times: state.timeStore.times })
const mapDispatchToProps = dispatch => bindActionCreators({ search, update, searchTimes }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Resultado)