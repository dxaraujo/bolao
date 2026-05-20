const authFetch = (url: string, options?: {[key: string]: any}) => {
	const headers: {[key: string]: string} = { 'Accept': 'application/json', 'Content-Type': 'application/json' }
	const token = localStorage.getItem('jwt_token')
	if (token) {
		headers['Authorization'] = 'Bearer ' + token
	}
	return fetch(url, { headers, ...options }).then(response => response.json())
}

export default authFetch