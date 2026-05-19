import { Navigate, Route, Routes } from 'react-router-dom'

import PartidaList from './partidaList'
import PartidaForm from './partidaForm'

const Partida = () => (
	<Routes>
		<Route path='create' element={<PartidaForm />} />
		<Route path='update' element={<PartidaForm />} />
		<Route path='list' element={<PartidaList />} />
		<Route path='*' element={<Navigate to='list' replace />} />
	</Routes>
)

export default Partida
