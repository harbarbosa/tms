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
  const session = authStorage.getSession()
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(session?.user?.company?.id ? { 'X-Company-Id': String(session.user.company.id) } : {}),
    },
  })

  if (!response.ok) {
    throw new Error(errorMessage)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

export const downloadProtectedFile = async (path, filename, errorMessage) => {
  const token = authStorage.getToken()
  const session = authStorage.getSession()
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(session?.user?.company?.id ? { 'X-Company-Id': String(session.user.company.id) } : {}),
    },
  })

  if (!response.ok) {
    throw new Error(errorMessage)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
