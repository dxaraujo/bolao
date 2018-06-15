import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { ButtonGroup, Button } from 'reactstrap'

import { handleChangeResultado as handleChange } from '../partida/partidaActions'

const ReadOnlyRow = ({ idx, partida, edit }) => (
	<tr key={partida._id} className='gridResultados'>
		<td className='text-center'>{idx + 1}</td>
		<td className='text-center'>
			<div className='rodada'>
				<div className='nomeTimeA'>
					<span className='h6 nomeTimeA'>{partida.timeA.sigla}</span>
				</div>
				<div className='bandeiraTimeA'>
					<i className={`bandeiraTimeA flag-icon flag-icon-${partida.timeA.bandeira}`} />
				</div>
				<div className='palpiteTimeA'>
					{partida.placarTimeA}
				</div>
				<div className='divisorPalpite'>x</div>
				<div className='palpiteTimeB'>
					{partida.placarTimeB}
				</div>
				<div className='bandeiraTimeB'>
					<i className={`bandeiraTimeB flag-icon flag-icon-${partida.timeB.bandeira}`} />
				</div>
				<div className='nomeTimeB'>
					<span className='h6 nomeTimeB'>{partida.timeB.sigla}</span>
				</div>
				<div className='horaPartida'>
					<span className='horaPartida text-secundary'>{partida.data}</span>
				</div>
			</div>
		</td>
		<td className='text-center'>
			<ButtonGroup>
				<Button className='text-white' size='sm' color='warning' onClick={edit}>
					<i className='fas fa-edit'></i>
				</Button>
			</ButtonGroup>
		</td>
	</tr>
)

const EditableRow = ({ idx, partida, handleChange, save, cancel }) => (
	<tr key={partida._id} className='gridResultados'>
		<td className='text-center'>{idx + 1}</td>
		<td className='text-center'>
			<div className='rodada'>
				<div className='nomeTimeA'>
					<span className='h6 nomeTimeA'>{partida.timeA.sigla}</span>
				</div>
				<div className='bandeiraTimeA'>
					<i className={`bandeiraTimeA flag-icon flag-icon-${partida.timeA.bandeira}`} />
				</div>
				<div className='palpiteTimeA'>
					<input name='placarTimeA' type='text' className='palpiteTimeA form-control' maxLength='1' value={partida.placarTimeA} onChange={event => handleChange(event, partida)} />
				</div>
				<div className='divisorPalpite'>x</div>
				<div className='palpiteTimeB'>
					<input name='placarTimeB' type='text' className='palpiteTimeB form-control' maxLength='1' value={partida.placarTimeB} onChange={event => handleChange(event, partida)} />
				</div>
				<div className='bandeiraTimeB'>
					<i className={`bandeiraTimeB flag-icon flag-icon-${partida.timeB.bandeira}`} />
				</div>
				<div className='nomeTimeB'>
					<span className='h6 nomeTimeB'>{partida.timeB.sigla}</span>
				</div>
				<div className='horaPartida'>
					<span className='horaPartida text-secundary'>{partida.data}</span>
				</div>
			</div>
		</td>
		<td className='text-center'>
			<ButtonGroup>
				<Button size='sm' color='success' onClick={() => save(partida)}>
					<i className='fas fa-check fa-fw'></i>
				</Button>
				<Button size='sm' color='danger' onClick={cancel}>
					<i className='fas fa-times fa-fw'></i>
				</Button>
			</ButtonGroup>
		</td>
	</tr>
)

class PartidaForm extends Component {

	constructor(props) {
		super(props)
		this.state = { isReadOnly: true }
	}

	edit = () => {
		this.setState({ isReadOnly: false })
	}

	cancel = () => {
		this.setState({ isReadOnly: true })
	}

	save = partida => {
		this.setState({ isReadOnly: true })
		this.props.update(partida)
	}

	handleChange = (event, partida) => {
		const name = event.target.name
		const value = event.target.value
		this.props.handleChange(name, value, partida, this.props.partidas)
	}

	render() {
		const { index, partida } = this.props
		return this.state.isReadOnly ?
			<ReadOnlyRow key={partida._id} idx={index} partida={partida} edit={this.edit} /> :
			<EditableRow key={partida._id} idx={index} partida={partida} handleChange={this.handleChange} save={this.save} cancel={this.cancel} />
	}
}

const mapStateToProps = state => ({ partidas: state.partidaStore.partidas })
const mapDispatchToProps = dispatch => bindActionCreators({ handleChange }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(PartidaForm)