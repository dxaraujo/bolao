import { backendURI } from '../../config'
import authFetch from '../../utils/fetchUtil'

const URL = `${backendURI}/api/fase`

export const FASE_SEARCH = 'FASE_SEARCH';

export const search = () => {
	const response = authFetch(URL)
	return { type: FASE_SEARCH, payload: response }
}