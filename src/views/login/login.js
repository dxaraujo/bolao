import React, { Component } from 'react';
import FacebookLogin from 'react-facebook-login'

import { Card, CardBody, Col, Container, Row } from 'reactstrap';

import withAuth from '../../components/withAuth'

class Login extends Component {

	loginWithFacebook = (response) => {
		this.props.loginWithFacebook(response, this.callbackFacebookLogin)
	}

	callbackFacebookLogin = () => {
		this.props.history.replace('/');
	}

	handleSubmit = event => {
		event.preventDefault();
		this.props.login(this.state.username, this.state.password).then(user => {
			this.props.history.replace('/');
		})
	}

	handleChange = event => {
		this.setState({ ...this.state, [event.target.name]: event.target.value })
	}

	render() {
		return (
			<div className="app flex-row align-items-center">
				<Container fluid>
					<Row className="justify-content-center">
						<Col md="4">
							<Card style={{ marginBottom: '0px' }}>
								<CardBody className="russia2018">
								</CardBody>
							</Card>
							<Card>
								<CardBody className="d-flex flex-column align-items-center justify-itens-center p-0">
									<h1 style={{ fontFamily: 'proximanova-bold' }}>Bolão Copa do Mundo</h1>
									<div className="align-content-center">
										<FacebookLogin
											appId="393226907829156"
											fields="id,name,email,picture"
											autoLoad={false}
											textButton={' Entrar com Facebook'}
											callback={this.loginWithFacebook}
											cssClass="btn btn-primary btn-lg mt-3"
											icon="fab fa-facebook"
										/>
									</div>
									<p className="text-muted mt-3">Realize o login com a sua conta do Facebook</p>
								</CardBody>
							</Card>
						</Col>
					</Row>
				</Container>
			</div >
		)
	}
}

export default withAuth(Login)