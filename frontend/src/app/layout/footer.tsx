import { version } from '../config/config'

const footer = () => {
	return (
		<>
			<span>Versão: {version}</span>
			<span className='ml-auto'>Criado por <a>dxaraujo</a> &copy; 2022</span>
		</>
	)
}

export default footer