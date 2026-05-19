const env = import.meta.env

const backendURI = env.VITE_BACKEND_URI || 'http://127.0.0.1:3001'
const rootUser = env.VITE_ROOT_USER || 'danielxaraujo@gmail.com'
const environment = env.VITE_ENVIRONMENT || 'DEVELOPMENT'
const googleClientId =
	env.VITE_GOOGLE_CLIENT_ID ||
	'399829588455-6fj76lpu2t0kj01n54msopm6dlvtm0pl.apps.googleusercontent.com'
const version = '2.1.3'

export { backendURI, rootUser, environment, googleClientId, version }
