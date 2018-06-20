import { backendURI } from '../../config'
import authFetch from '../../utils/fetchUtil'

const URL = `${backendURI}/api/fase`

export const FASE_SEARCH = 'FASE_SEARCH';
export const FASE_SELECT = 'FASE_SELECT';

export const search = (faseId) => {
	const response = authFetch(URL)
	if (faseId) {
		return [{ type: FASE_SEARCH, payload: response }, { type: FASE_SELECT, payload: { data: faseId } }]
	}
	return { type: FASE_SEARCH, payload: response }
}