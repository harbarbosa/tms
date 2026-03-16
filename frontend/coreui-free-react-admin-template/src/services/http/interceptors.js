import store from '../../store'
import authStorage from '../auth/authStorage'
import apiClient from './apiClient'

const isJsonSerializable = (body) =>
  body && !(body instanceof FormData) && typeof body !== 'string'

const normalizeRequest = async (config) => {
  const token = authStorage.getToken()
  const session = authStorage.getSession()
  const headers = new Headers(config.headers || {})

  headers.set('Accept', 'application/json')
  headers.set('X-Requested-With', 'XMLHttpRequest')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (session?.user?.company?.id) {
    headers.set('X-Company-Id', String(session.user.company.id))
  }

  if (isJsonSerializable(config.body)) {
    headers.set('Content-Type', 'application/json')
  }

  return {
    ...config,
    headers,
    body: isJsonSerializable(config.body) ? JSON.stringify(config.body) : config.body,
  }
}

const handleResponse = async ({ path, response, data, error }) => {
  if (!response) {
    store.dispatch({
      type: 'app/setError',
      payload: error?.message || 'Nao foi possivel comunicar com a API.',
    })
    return
  }

  if (response.ok) {
    return
  }

  if (response.status === 401) {
    const isSessionRoute = path === '/auth/me' || path === '/auth/logout'
    const hasToken = Boolean(authStorage.getToken())

    if (isSessionRoute || hasToken) {
      authStorage.clearSession()
      store.dispatch({ type: 'auth/logout' })
      store.dispatch({
        type: 'app/setError',
        payload: 'Sua sessao expirou. Entre novamente para continuar.',
      })
      return
    }

    store.dispatch({
      type: 'app/setError',
      payload: data?.message || data?.messages?.error || 'Nao foi possivel autenticar com as credenciais informadas.',
    })
    return
  }

  store.dispatch({
    type: 'app/setError',
    payload:
      data?.message ||
      data?.messages?.error ||
      'Ocorreu um erro inesperado ao comunicar com o servidor.',
  })
}

apiClient.addRequestInterceptor(normalizeRequest)
apiClient.addResponseInterceptor(handleResponse)

export default apiClient
