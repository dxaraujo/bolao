import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { rootUser } from '../../config'

import { ButtonGroup, Button, CustomInput } from 'reactstrap'
import { handleChange } from './faseActions'
import If from '../../components/if'

const ReadOnlyRow = ({ user, idx, fase, edit }) => (
	<tr key={fase._id} className='gridFases'>
		<td className='text-center'>{idx + 1}</td>
		<td>{fase.nome}</td>
		<td className='text-center'>{fase.status}</td>
		<td className='text-center'>
			<If test={rootUser === user.email}>
				<Button className='text-white' size='sm' color='warning' onClick={edit}>
					<i className='fas fa-edit'></i>
				</Button>
			</If>
		</td>
	</tr>
)

const EditableRow = ({ user, idx, fase, handleChange, save, cancel }) => (
	<tr key={fase._id} className='gridFases'>
		<td className='text-center'>{idx + 1}</td>
		<td>{fase.nome}</td>
		<If test={rootUser === user.email}>
			<td className='text-center'>
				<CustomInput id='status' name='status' type='select' value={fase.status} onChange={event => handleChange(event, fase)}>
					<option key={'D'} value={'D'}>D</option>
					<option key={'A'} value={'A'}>A</option>
					<option key={'B'} value={'B'}>B</option>
				</CustomInput>
			</td>
		</If>
		<If test={rootUser !== user.email}>
			<td className='text-center'>{fase.status}</td>
		</If>
		<td className='text-center'>
			<ButtonGroup>
				<Button size='sm' color='success' onClick={() => save(fase)}>
					<i className='fas fa-check fa-fw'></i>
				</Button>
				<Button size='sm' color='danger' onClick={() => cancel(fase)}>
					<i className='fas fa-times fa-fw'></i>
				</Button>
			</ButtonGroup>
		</td>
	</tr>
)

class UserForm extends Component {
	constructor(props) {
		super(props)
		this.state = { isReadOnly: true }
		this.save = this.save.bind(this)
		this.edit = this.edit.bind(this)
		this.cancel = this.cancel.bind(this)
		this.handleChange = this.handleChange.bind(this)
	}
	edit() {
		this.setState({ isReadOnly: false })
	}
	cancel(fase) {
		this.setState({ isReadOnly: true })
	}
	save(fase) {
		this.setState({ isReadOnly: true })
		this.props.update(fase)
	}
	handleChange(event, fase) {
		fase.status = event.target.value
		this.props.handleChange(fase, this.props.fases)
	}
	render() {
		const { index, fase, user } = this.props
		return this.state.isReadOnly ?
			<ReadOnlyRow key={fase._id} idx={index} fase={fase} user={user} edit={this.edit} /> :
			<EditableRow key={fase._id} idx={index} fase={fase} user={user} handleChange={this.handleChange} save={this.save} cancel={this.cancel} />
	}
}

const mapStateToProps = state => ({ fases: state.faseStore.fases, selectedUser: state.faseStore.selectedUser })
const mapDispatchToProps = dispatch => bindActionCreators({ handleChange }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(UserForm)