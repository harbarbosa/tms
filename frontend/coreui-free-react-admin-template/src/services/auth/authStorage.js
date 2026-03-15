const AUTH_STORAGE_KEY = 'tms.auth.session'

export const authStorage = {
  getSession() {
    try {
      const session = localStorage.getItem(AUTH_STORAGE_KEY)
      return session ? JSON.parse(session) : null
    } catch (error) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }
  },

  setSession(session) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  },

  clearSession() {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  },

  getToken() {
    return this.getSession()?.token || null
  },
}

export default authStorage
