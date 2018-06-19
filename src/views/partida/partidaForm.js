import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import moment from 'moment'

import { toast } from "react-toastify";

import { Col, Card, CardHeader, CardBody, CardFooter, Form, FormGroup, CustomInput, InputGroup, InputGroupAddon, InputGroupText, Button, Label } from 'reactstrap'
import MaskedInput from 'react-maskedinput'

import { update, create, handleChange, reset } from './partidaActions'

class PartidaForm extends Component {

	handleSubmit = event => {
		event.preventDefault()
		const partida = this.props.partida
		partida.timeA = this.props.times.find(time => time.nome === partida.timeA)
		partida.timeB = this.props.times.find(time => time.nome === partida.timeB)
		partida.data = moment.parseZone(partida.data, 'DD/MM/YYYY hh:mm:ss')
		if (partida._id) {
			this.props.update(partida)
			toast.success('Partida atualizada com sucesso');
		} else {
			this.props.create(partida)
			toast.success('Partida inserida com sucesso');
		}
	}

	back = () => {
		this.props.reset()
		this.props.history.goBack()
	}

	render() {
		const partida = this.props.partida
		return (
			<Card>
				<CardHeader>Cadastro de Partidas</CardHeader>
				<CardBody>
					<Form className='form-horizontal' onSubmit={this.handleSubmit}>
					<FormGroup row>
							<Col xs='12' md='2'>
								<Label>Ordem</Label>
							</Col>
							<Col xs='12' md='10'>
								<InputGroup className='input-prepend'>
									<CustomInput id='order' name='order' type='text' className='form-control' value={partida.order || ''} onChange={this.props.handleChange} />
									<InputGroupAddon addonType='append'>
										<InputGroupText>@</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
							</Col>
						</FormGroup>
						<FormGroup row>
							<Col xs='12' md='2'>
								<Label>Fase</Label>
							</Col>
							<Col xs='12' md='10'>
								<InputGroup className='input-prepend'>
									<CustomInput id='fase' name='fase' type='select' value={partida.fase} onChange={this.props.handleChange}>
										<option value="">Selecione uma Fase</option>
										<option value="FASE DE GRUPOS">FASE DE GRUPOS</option>
										<option value="OITAVAS DE FINAL">OITAVAS DE FINAL</option>
										<option value="QUARTAS DE FINAL">QUARTAS DE FINAL</option>
										<option value="SEMIFINAL">SEMIFINAL</option>
										<option value="DISPUTA DO 3º LUGAR">DISPUTA DO 3º LUGAR</option>
										<option value="FINAL">FINAL</option>
									</CustomInput>
									<InputGroupAddon addonType='append'>
										<InputGroupText>@</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
							</Col>
						</FormGroup>
						<FormGroup row>
							<Col xs='12' md='2'>
								<Label>Grupo</Label>
							</Col>
							<Col xs='12' md='10'>
								<InputGroup className='input-prepend'>
									<CustomInput id='grupo' name='grupo' type='select' value={partida.grupo} onChange={this.props.handleChange}>
										<option value="">Selecione um Grupo</option>
										<option value="GRUPO A">SEM GRUPO</option>
										<option value="GRUPO A">GRUPO A</option>
										<option value="GRUPO B">GRUPO B</option>
										<option value="GRUPO C">GRUPO C</option>
										<option value="GRUPO D">GRUPO D</option>
										<option value="GRUPO E">GRUPO E</option>
										<option value="GRUPO F">GRUPO F</option>
										<option value="GRUPO G">GRUPO G</option>
										<option value="GRUPO H">GRUPO H</option>
									</CustomInput>
									<InputGroupAddon addonType='append'>
										<InputGroupText>@</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
							</Col>
						</FormGroup>
						<FormGroup row>
							<Col xs='12' md='2'>
								<Label>Rodada</Label>
							</Col>
							<Col xs='12' md='10'>
								<InputGroup className='input-prepend'>
									<CustomInput id='rodada' name='rodada' type='select' value={partida.rodada} onChange={this.props.handleChange}>
										<option value="">Selecione uma Rodada</option>
										<option value=''>SEM RODADA</option>
										<option value="1ª RODADA">1ª RODADA</option>
										<option value="2ª RODADA">2ª RODADA</option>
										<option value="3ª RODADA">3ª RODADA</option>
									</CustomInput>
									<InputGroupAddon addonType='append'>
										<InputGroupText>@</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
							</Col>
						</FormGroup>
						<FormGroup row>
							<Col xs='12' md='2'>
								<Label>Data</Label>
							</Col>
							<Col xs='12' md='10'>
								<InputGroup className='input-prepend'>
									<MaskedInput mask='11/11/1111 11:11:11' id='data' name='data' type='text' className='form-control' value={partida.data || ''} onChange={this.props.handleChange} />
									<InputGroupAddon addonType='append'>
										<InputGroupText>@</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
							</Col>
						</FormGroup>
						<FormGroup row>
							<Col xs='12' md='2'>
								<Label>Time A</Label>
							</Col>
							<Col xs='12' md='10'>
								<InputGroup className='input-prepend'>
									<CustomInput id='timeA' name='timeA' type='select' value={partida.timeA ? partida.timeA.nome : ''} onChange={this.props.handleChange}>
										<option value=''>Selecione um Time</option>
										{this.props.times.map((time, idx) => (
											<option key={idx} value={time.nome}>{time.nome}</option>
										))}
									</CustomInput>
									<InputGroupAddon addonType='append'>
										<InputGroupText>@</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
							</Col>
						</FormGroup>
						<FormGroup row>
							<Col xs='12' md='2'>
								<Label>Time B</Label>
							</Col>
							<Col xs='12' md='10'>
								<InputGroup className='input-prepend'>
									<CustomInput id='timeB' name='timeB' type='select' defaultValue={partida.timeB ? partida.timeB.nome : ''} onChange={this.props.handleChange}>
										<option value=''>Selecione um Time</option>
										{this.props.times.map((time, idx) => (
											<option key={idx} value={time.nome}>{time.nome}</option>
										))}
									</CustomInput>
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

const mapStateToProps = state => ({ partida: state.partidaStore.partida, times: state.timeStore.times })
const mapDispatchToProps = dispatch => bindActionCreators({ update, create, handleChange, reset }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(PartidaForm)