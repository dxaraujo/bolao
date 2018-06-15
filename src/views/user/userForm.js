import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { rootUser } from '../../config'

import { ButtonGroup, Button, CustomInput } from 'reactstrap'
import { handleChange } from './userActions'
import If from '../../components/if'

import blackAvatar from '../../assets/img/blankavatar.svg'

const ReadOnlyRow = ({ idx, user, edit }) => (
	<tr key={user._id} className='gridUsers'>
		<td className='text-center'>{idx + 1}</td>
		<td><img alt='avatar' src={user.avatar ? `https://graph.facebook.com/${user.facebookId}/picture?width=${500}&height=${500}` : blackAvatar} className='img-avatar' width={50} height={50} /></td>
		<td>{user.name}</td>
		<td className='text-center'><i className={`fas fa-check text-${user.isAdmin ? 'success' : 'secondary'}`}></i></td>
		<td className='text-center'>
			<If test={rootUser !== user.username} >
				<Button className='text-white' size='sm' color='warning' onClick={edit}>
					<i className='fas fa-edit'></i>
				</Button>
			</If>
		</td>
	</tr>
)

const EditableRow = ({ idx, user, handleChange, save, cancel }) => (
	<tr key={user._id} className='gridUsers'>
		<td className='text-center'>{idx + 1}</td>
		<td><img alt='avatar' src={user.avatar ? `https://graph.facebook.com/${user.facebookId}/picture?width=${500}&height=${500}` : blackAvatar} className='img-avatar' width={50} height={50} /></td>
		<td>{user.name}</td>
		<td className='d-flex justify-content-center'><CustomInput id='isAdmin' name='isAdmin' type='checkbox' checked={user.isAdmin} onChange={(event) => handleChange(event, user)} /></td>
		<td className='text-center'>
			<ButtonGroup>
				<Button size='sm' color='success' onClick={() => save(user)}>
					<i className='fas fa-check fa-fw'></i>
				</Button>
				<Button size='sm' color='danger' onClick={() => cancel(user)}>
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
	cancel(user) {
		this.setState({ isReadOnly: true })
	}
	save(user) {
		this.setState({ isReadOnly: true })
		this.props.update(user)
	}
	handleChange(event, user) {
		user.isAdmin = event.target.checked
		this.props.handleChange(user, this.props.users)
	}
	render() {
		const { index, user } = this.props
		return this.state.isReadOnly ?
			<ReadOnlyRow key={user._id} idx={index} user={user} edit={this.edit} /> :
			<EditableRow key={user._id} idx={index} user={user} handleChange={this.handleChange} save={this.save} cancel={this.cancel} />
	}
}

const mapStateToProps = state => ({ users: state.userStore.users, selectedUser: state.userStore.selectedUser })
const mapDispatchToProps = dispatch => bindActionCreators({ handleChange }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(UserForm)