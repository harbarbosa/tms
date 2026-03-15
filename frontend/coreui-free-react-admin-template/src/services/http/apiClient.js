import env from '../../app/config/env'

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status || null
    this.data = options.data || null
  }
}

const joinUrl = (baseUrl, path) => {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  if (contentType.includes('text/')) {
    return response.text()
  }

  return null
}

class ApiClient {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl
    this.requestInterceptors = []
    this.responseInterceptors = []
  }

  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor)
  }

  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor)
  }

  async request(path, options = {}) {
    let requestConfig = {
      method: 'GET',
      headers: {},
      ...options,
    }

    for (const interceptor of this.requestInterceptors) {
      requestConfig = (await interceptor(requestConfig)) || requestConfig
    }

    const requestUrl = joinUrl(this.baseUrl, path)
    const response = await fetch(requestUrl, requestConfig)
    const data = await parseResponseBody(response)

    for (const interceptor of this.responseInterceptors) {
      await interceptor({ path, requestUrl, requestConfig, response, data })
    }

    if (!response.ok) {
      const message =
        data?.message || data?.messages?.error || 'Nao foi possivel concluir a requisicao.'

      throw new ApiError(message, {
        status: response.status,
        data,
      })
    }

    return data
  }

  get(path, options = {}) {
    return this.request(path, { ...options, method: 'GET' })
  }

  post(path, body, options = {}) {
    return this.request(path, { ...options, method: 'POST', body })
  }

  put(path, body, options = {}) {
    return this.request(path, { ...options, method: 'PUT', body })
  }

  patch(path, body, options = {}) {
    return this.request(path, { ...options, method: 'PATCH', body })
  }

  delete(path, options = {}) {
    return this.request(path, { ...options, method: 'DELETE' })
  }
}

const apiClient = new ApiClient({ baseUrl: env.apiBaseUrl })

export default apiClient
