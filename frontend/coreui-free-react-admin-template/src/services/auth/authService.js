import env from '../../app/config/env'
import authStorage from './authStorage'
import apiClient from '../http/interceptors'

const createMockSession = (credentials) => ({
  token: 'mock-jwt-token',
  refreshToken: null,
  user: {
    id: 1,
    name: 'Administrador Master',
    email: credentials.email,
    role: 'master_admin',
    role_name: 'Administrador master',
    companyName: 'TMS Demo',
    permissions: ['dashboard.view'],
    scope: {
      company_id: 1,
      carrier_id: null,
      driver_id: null,
    },
  },
})

export const authService = {
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      const session = normalizeSessionResponse(response?.data)

      authStorage.setSession(session)
      return session
    } catch (error) {
      if (env.mockAuthEnabled && [404, 405, null].includes(error.status)) {
        const session = createMockSession(credentials)
        authStorage.setSession(session)
        return session
      }

      throw error
    }
  },

  async me() {
    const response = await apiClient.get('/auth/me')
    const currentSession = authStorage.getSession()
    const session = normalizeSessionResponse({
      token: currentSession?.token || null,
      user: response?.data?.user,
      company: response?.data?.company,
      claims: response?.data?.claims,
      access: response?.data?.access,
    })

    authStorage.setSession(session)
    return session
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout', {})
    } catch (error) {
      // Logout should not block the local session cleanup.
    }

    authStorage.clearSession()
  },

  clearLocalSession() {
    authStorage.clearSession()
  },

  getSession() {
    return authStorage.getSession()
  },
}

function normalizeSessionResponse(data) {
  const company = data?.company || data?.user?.company || null
  const role = data?.user?.role || data?.access?.role?.slug || data?.claims?.role || null
  const roleName = data?.user?.role_name || data?.access?.role?.name || null
  const permissions = data?.user?.permissions || data?.access?.permissions || []
  const scope = data?.user?.scope || data?.access?.scope || {}

  return {
    token: data?.token || data?.accessToken || null,
    refreshToken: data?.refreshToken || null,
    user: data?.user
      ? {
          ...data.user,
          role,
          role_name: roleName,
          permissions,
          scope,
          company,
          companyName: company?.name || null,
        }
      : null,
  }
}

export default authService
