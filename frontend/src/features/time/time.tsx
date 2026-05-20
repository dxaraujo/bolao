import { Navigate, Route, Routes } from 'react-router-dom'

import TimeList from './timeList'
import TimeForm from './timeForm'

const Time = () => (
	<Routes>
		<Route path='create' element={<TimeForm />} />
		<Route path='update' element={<TimeForm />} />
		<Route path='list' element={<TimeList />} />
		<Route path='*' element={<Navigate to='list' replace />} />
	</Routes>
)

export default Time
