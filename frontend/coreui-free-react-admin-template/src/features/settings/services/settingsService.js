import apiClient from '../../../services/http/interceptors'

const settingsService = {
  async fetch() {
    const response = await apiClient.get('/settings')
    return response.data
  },

  async updateGlobal(payload) {
    const response = await apiClient.put('/settings/global', payload)
    return response.data
  },

  async updateCompany(payload) {
    const response = await apiClient.put('/settings/company', payload)
    return response.data
  },

  async catalogOptions() {
    const response = await apiClient.get('/settings/catalogs/options')
    return response.data
  },

  async listCatalogs(params) {
    const query = new URLSearchParams()
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        query.append(key, String(value))
      }
    })

    const response = await apiClient.get(`/settings/catalogs${query.toString() ? `?${query.toString()}` : ''}`)
    return response.data
  },

  async createCatalogItem(payload) {
    const response = await apiClient.post('/settings/catalogs', payload)
    return response.data
  },

  async updateCatalogItem(id, payload) {
    const response = await apiClient.put(`/settings/catalogs/${id}`, payload)
    return response.data
  },

  async updateCatalogItemStatus(id, status) {
    const response = await apiClient.patch(`/settings/catalogs/${id}/status`, { status })
    return response.data
  },
}

export default settingsService
