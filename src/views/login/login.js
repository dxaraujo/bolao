import React, { Component } from 'react';
import FacebookLogin from 'react-facebook-login'

import { Card, CardBody, CardGroup, Col, Container, Row } from 'reactstrap';

import withAuth from '../../components/withAuth'
import logo from '../../assets/img/brand/logo.png'

class Login extends Component {
	constructor(props) {
		super(props)
		this.state = { error: {} }
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	loginWithFacebook = (response) => {
		this.props.loginWithFacebook(response, this.callbackFacebookLogin)
	}

	callbackFacebookLogin = () => {
		this.props.history.replace('/');
	}

	onFacebookLoginFailure = err => {
		this.setState({ error: JSON.stringify(err) })
	}

	handleSubmit(event) {
		event.preventDefault();
		this.props.login(this.state.username, this.state.password).then(user => {
			this.props.history.replace('/');
		})
	}

	handleChange(event) {
		this.setState({ ...this.state, [event.target.name]: event.target.value })
	}

	render() {
		console.log(this.props)
		return (
			<div className="app flex-row align-items-center">
				<Container>
					<Row className="justify-content-center">
						<Col md="8">
							<CardGroup>
								<Card className="p-4">
									<CardBody>
										<Row style={{ marginBottom: '5px' }}>
											<span>{this.state.error || ' '}</span>
										</Row>
										<Row style={{ marginBottom: '5px', textAlign: 'center' }}>
											<Col xs="12">
												<img style={{ objectFit: 'contain' }} src={logo} alt="Logo" width="100%" height="auto" />
												<FacebookLogin
													appId="393226907829156"
													fields="id, name,email,picture"
													autoLoad={false}
													redirectUri={this.props.location.url}
													textButton={' Entrar com Facebook'}
													callback={this.loginWithFacebook}
													onFailure={this.onFacebookLoginFailure}
													cssClass="btn btn-primary btn-lg mt-3"
													icon="fab fa-facebook"
												/>
												<p className="text-muted mt-3">Realize o login com a sua conta do Facebook</p>
											</Col>
										</Row>
									</CardBody>
								</Card>
								<Card className="text-white bg-primary d-md-down-none">
									<CardBody className="text-center align-middle" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
										<h2>Entrar com Facebook Disponível</h2>
										<p>Agora você pode fazer o login usando Facebook</p>
									</CardBody>
								</Card>
							</CardGroup>
						</Col>
					</Row>
				</Container>
			</div >
		)
	}
}

export default withAuth(Login)