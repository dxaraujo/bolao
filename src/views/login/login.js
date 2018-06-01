import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

import { Form, Button, Card, CardBody, CardGroup, Col, Container, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';

import { setUser } from '../user/userActions'
import withAuth from '../../components/withAuth'

class Login extends Component {

	constructor(props) {
		super(props)
		this.state = { username: null, password: null }
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.callbackFacebookLogin = this.callbackFacebookLogin.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();
		this.props.login(this.state.username, this.state.password).then(user => {
			this.props.history.replace('/');
		})
	}

	callbackFacebookLogin() {
		this.props.history.replace('/');
	}

	handleChange(event) {
		this.setState({ ...this.state, [event.target.name]: event.target.value })
	}

	render() {
		return (
			<div className="app flex-row align-items-center">
				<Container>
					<Row className="justify-content-center">
						<Col md="8">
							<CardGroup>
								<Card className="p-4">
									<CardBody>
										<Form onSubmit={this.handleSubmit}>
											<h1>Login</h1>
											<p className="text-muted">Realize o login com a sua conta</p>
											<InputGroup className="mb-3">
												<InputGroupAddon addonType="prepend">
													<InputGroupText>
														<i className="fas fa-user"></i>
													</InputGroupText>
												</InputGroupAddon>
												<Input type="text" placeholder="Username" name="username" onChange={this.handleChange} />
											</InputGroup>
											<InputGroup className="mb-4">
												<InputGroupAddon addonType="prepend">
													<InputGroupText>
														<i className="fas fa-lock"></i>
													</InputGroupText>
												</InputGroupAddon>
												<Input type="password" placeholder="Password" name="password" onChange={this.handleChange} />
											</InputGroup>
											<Row style={{marginBottom: '5px'}}>
												<Col xs="12">
													<Button color="primary" type="submit" className='btn-block' onClick={this.handleSubmit}>Login</Button>
												</Col>
											</Row>
											<Row style={{marginBottom: '5px'}}>
												<Col xs="12" className='d-lg-none'>
													<FacebookLogin
														appId="185587412097498"
														fields="name,email,picture"
														callback={content => this.props.loginWithFacebook(content, this.callbackFacebookLogin)}
														render={renderProps => <Button color='primary' className='btn-block' onClick={renderProps.onClick}><i className="fab fa-facebook-f"/><span>  Facebook</span></Button>}
													/>
												</Col>
											</Row>
											<Row>
												<Col xs="12">
													<Button color="link" className="px-0">Esqueceu a senha?</Button>
												</Col>
											</Row>
										</Form>
									</CardBody>
								</Card>
								<Card className="text-white bg-primary py-5 d-md-down-none" style={{ width: 44 + '%' }}>
									<CardBody className="text-center">
										<div>
											<h2>Login com Facebook Dispo'nivel</h2>
											<p>Agora você pode fazer o login usando Facebook</p>
											<FacebookLogin
												appId="185587412097498"
												autoLoad={true}
												fields="name,email,picture"
												callback={this.props.loginWithFacebook}
												render={renderProps => <Button color='primary' className='btn-block' onClick={renderProps.onClick}><i className="fab fa-facebook-f"/><span>  Facebook</span></Button>}
											/>
										</div>
									</CardBody>
								</Card>
							</CardGroup>
						</Col>
					</Row>
				</Container>
			</div>
		)
	}
}

const mapStateToProps = state => ({ user: state.userStore.user })
const mapDispatchToProps = dispatch => bindActionCreators({ setUser }, dispatch)

export default withAuth(connect(mapStateToProps, mapDispatchToProps)(Login))