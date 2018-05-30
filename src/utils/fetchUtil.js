const authFetch = (url, options) => {
	const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' }
	const token = localStorage.getItem('jwt_token')
	if (token) {
		headers['Authorization'] = 'Bearer ' + token
	}
	return fetch(url, { headers, ...options }).then(response => response.json())
}

export default authFetch