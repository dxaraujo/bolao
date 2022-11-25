const backendURI = process.env.REACT_APP_BACKEND_URI || 'http://127.0.0.1:3001'
const rootUser = process.env.REACT_APP_ROOT_USER || 'danielxaraujo@gmail.com'
const environment = process.env.REACT_APP_PRODUCTION || 'DEVELOPMENT'

export { backendURI, rootUser, environment }