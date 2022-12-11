const backendURI = process.env.REACT_APP_BACKEND_URI || 'http://127.0.0.1:3001'
const rootUser = process.env.REACT_APP_ROOT_USER || 'danielxaraujo@gmail.com'
const environment = process.env.REACT_APP_PRODUCTION || 'DEVELOPMENT'
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '399829588455-6fj76lpu2t0kj01n54msopm6dlvtm0pl.apps.googleusercontent.com'
const version = '2.1.3'

export { backendURI, rootUser, environment, googleClientId, version }