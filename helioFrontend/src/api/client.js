import axios from 'axios'
import { captureAuthenticatedIdentity, invalidateAuthenticatedIdentity } from './authenticatedIdentity'

export const api = axios.create({ baseURL: localStorage.getItem('apiBase') || 'http://localhost:5000' })

export function setApiBase(baseUrl) {
  const cleanUrl = baseUrl.replace(/\/$/, '')
  localStorage.setItem('apiBase', cleanUrl)
  api.defaults.baseURL = cleanUrl
}

export async function request(method, path, data, token = '') {
  try {
    const result = await api({ method, url: path, data, headers: token ? { Authorization: `Bearer ${token}` } : {} })
    await captureAuthenticatedIdentity(method, path, result.data, token)
    return result.data
  } catch (error) {
    if (token && error.response?.status === 401) {
      for (const role of ['doctor', 'clinic', 'patient']) {
        if (localStorage.getItem(`${role}AccessToken`) === token) invalidateAuthenticatedIdentity(role, token)
      }
    }
    throw error
  }
}

export function readApiError(error) {
  return error.response?.data || { message: error.message || 'Request failed' }
}
