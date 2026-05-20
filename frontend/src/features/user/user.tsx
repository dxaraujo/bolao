import { Navigate, Route, Routes } from 'react-router-dom'

import UserList from './userList'
import UserForm from './userForm'

const User = () => (
	<Routes>
		<Route path='update' element={<UserForm />} />
		<Route path='list' element={<UserList />} />
		<Route path='*' element={<Navigate to='list' replace />} />
	</Routes>
)

export default User
