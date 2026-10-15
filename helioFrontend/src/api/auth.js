import { request } from './client'

export const userAuth = { register: (body) => request('post', '/api/auth/register', body), login: (body) => request('post', '/api/auth/login', body), me: (token) => request('get', '/api/auth/me', null, token) }
export const clinicAuth = { register: (body) => request('post', '/api/cliniAuthRoutes/register', body), login: (body) => request('post', '/api/cliniAuthRoutes/login', body), me: (token) => request('get', '/api/cliniAuthRoutes/clinicMe', null, token) }
export const doctorAuth = { register: (body) => request('post', '/api/doctor-auth/register', body), login: (body) => request('post', '/api/doctor-auth/login', body), me: (token) => request('get', '/api/doctor-auth/me', null, token) }
