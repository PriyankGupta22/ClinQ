import { request } from './client'

export const queueApi = { get: ({ clinicId, doctorId, date }, token) => request('get', `/api/queue/getQueue/${clinicId}/${doctorId}/${encodeURIComponent(date)}`, null, token), start: (entryId, token) => request('patch', `/api/queue/queue/${entryId}/start`, null, token), complete: (entryId, token) => request('patch', `/api/queue/queue/${entryId}/complete`, null, token) }
