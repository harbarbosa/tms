import env from '../../app/config/env'
import authStorage from '../auth/authStorage'

export const buildQueryPath = (path, params = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      query.append(key, String(value))
    }
  })

  const queryString = query.toString()

  return queryString ? `${path}?${queryString}` : path
}

export const openProtectedFile = async (path, errorMessage) => {
  const token = authStorage.getToken()
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    throw new Error(errorMessage)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
