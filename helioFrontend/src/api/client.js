import axios from 'axios'

export const api = axios.create({ baseURL: localStorage.getItem('apiBase') || 'http://localhost:5000' })

export function setApiBase(baseUrl) {
  const cleanUrl = baseUrl.replace(/\/$/, '')
  localStorage.setItem('apiBase', cleanUrl)
  api.defaults.baseURL = cleanUrl
}

export async function request(method, path, data, token = '') {
  const result = await api({ method, url: path, data, headers: token ? { Authorization: `Bearer ${token}` } : {} })
  return result.data
}

export function readApiError(error) {
  return error.response?.data || { message: error.message || 'Request failed' }
}
