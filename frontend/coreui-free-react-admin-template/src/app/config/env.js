/**
 * Frontend environment helpers.
 *
 * Centralizes runtime configuration used by the TMS admin app.
 */

const fallbackApiBaseUrl = 'http://localhost:8080/api/v1'



export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || fallbackApiBaseUrl).replace(/\/+$/, ''),
  mockAuthEnabled: import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true',
}

export default env
