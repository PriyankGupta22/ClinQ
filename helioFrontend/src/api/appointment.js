import { request } from './client'

export const appointmentApi = { create: (body, token) => request('post', '/api/appointment/appointment', body, token), mine: (token) => request('get', '/api/appointment/my-appointments', null, token), doctor: (body, token) => request('get', '/api/appointment/doctor-appointments', body, token), status: (body, token) => request('put', '/api/appointment/status', body, token) }
