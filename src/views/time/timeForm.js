import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { toast } from "react-toastify";

import { Col, Card, CardHeader, CardBody, CardFooter, Form, FormGroup, Input, InputGroup, InputGroupAddon, InputGroupText, Button, Label } from 'reactstrap'

import { update, create, handleChange, reset } from './timeActions'

class TimeForm extends Component {
	constructor(props) {
		super(props)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.back = this.back.bind(this)
	}
	handleSubmit(event) {
		event.preventDefault()
		const time = this.props.time
		if (time._id) {
			this.props.update(time)
			toast.success('Time atualizada com sucesso');
		} else {
			this.props.create(time)
			toast.success('Time inserida com sucesso');
		}
	}
	back() {
		this.props.reset()
		this.props.history.goBack()
	}
	render() {
		const time = this.props.time
		return (
			<Card>
				<CardHeader>Cadastro de Times</CardHeader>
				<CardBody>
					<Form className='form-horizontal' onSubmit={this.handleSubmit}>
						<FormGroup row>
							<Col xs='12' md='2'>
								<Label>Nome</Label>
							</Col>
							<Col xs='12' md='10'>
								<InputGroup className='input-prepend'>
									<Input name='nome' type='text' value={time.nome} onChange={this.props.handleChange} placeholder='Nome do Time, Ex: Brasil' />
									<InputGroupAddon addonType='append'>
										<InputGroupText>@</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
							</Col>
						</FormGroup>
						<FormGroup row>
							<Col xs='12' md='2'>
								<Label>Sigla</Label>
							</Col>
							<Col xs='12' md='10'>
								<InputGroup className='input-prepend'>
									<Input name='sigla' type='text' value={time.sigla} onChange={this.props.handleChange} placeholder='Sigla do Time. Ex: BRA' />
									<InputGroupAddon addonType='append'>
										<InputGroupText>@</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
							</Col>
						</FormGroup>
						<FormGroup row>
							<Col xs='12' md='2'>
								<Label>Bandeira</Label>
							</Col>
							<Col xs='12' md='10'>
								<InputGroup className='input-prepend'>
									<Input name='bandeira' type='text' value={time.bandeira} onChange={this.props.handleChange} placeholder='Bandeira do time, Ex: br' />
									<InputGroupAddon addonType='append'>
										<InputGroupText>@</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
							</Col>
						</FormGroup>
					</Form>
				</CardBody>
				<CardFooter className='app-card-footer'>
					<Button color='primary' size='sm' onClick={this.handleSubmit}>
						<i className='fas fa-save'></i> Salvar
					</Button>
					<Button color='secundary' size='sm' onClick={this.back}>
						<i className='fas fa-undo'></i> Voltar
					</Button>
				</CardFooter>
			</Card >
		)
	}
}

const mapStateToProps = state => ({ time: state.timeStore.time })
const mapDispatchToProps = dispatch => bindActionCreators({ update, create, handleChange, reset }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(TimeForm)