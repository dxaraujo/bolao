import { useHistory } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { Card, CardBody, Col, Container, Row } from 'reactstrap'
import { loginWithGoogle } from '../../app/auth/authService'
import { toast } from "react-toastify";

const Login = () => {

	const history = useHistory()

	const handleSuccess = (credentialResponse: any) => {		
		loginWithGoogle(credentialResponse.credential, () => history.replace('/'))
	}

	const handleError = () => {
		toast.error('Erro ao realizar o login com o Google');
	}

	return (
		<div className='app flex-row align-items-center'>
			<Container fluid>
				<Row className='justify-content-center'>
					<Col md='6' lg='4' sm='12'>
						<Card style={{ marginBottom: '0px' }}>
							<CardBody className='russia2018'>
							</CardBody>
						</Card>
						<Card>
							<CardBody className='d-flex flex-column align-items-center justify-itens-center p-0'>
								<h1 style={{ fontFamily: 'proximanova-bold' }}>Bolão Copa do Mundo</h1>
								<div className='align-content-center'>
									<GoogleLogin onSuccess={handleSuccess} onError={handleError} useOneTap auto_select />
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

export default Login