import React, { Component } from 'react';

import { Card, CardBody, Col, Container, Row } from 'reactstrap';

import withAuth from '../../components/withAuth'

class Login extends Component {

	render() {
		return (
			<div className='app flex-row align-items-center'>
				<Container fluid>
					<Row className='justify-content-center'>
						<Col md='4'>
							<Card style={{ marginBottom: '0px' }}>
								<CardBody className='russia2018'>
								</CardBody>
							</Card>
							<Card>
								<CardBody className='d-flex flex-column align-items-center justify-itens-center p-0'>
									<h1 style={{ fontFamily: 'proximanova-bold' }}>Bolão Copa do Mundo</h1>
									<div className='align-content-center'>
										<div id='g_id_onload' data-auto_select="true" data-client_id='399829588455-6fj76lpu2t0kj01n54msopm6dlvtm0pl.apps.googleusercontent.com' data-callback='handleCredentialResponse'></div>
    									<div className='g_id_signin' data-type='standard'></div>
									</div>
									<p className='text-muted mt-3'>Realize o login com a sua conta do Google</p>
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