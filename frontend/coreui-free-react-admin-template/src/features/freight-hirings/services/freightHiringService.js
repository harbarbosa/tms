import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const freightHiringService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/freight-hirings', params))
    return response.data
  },

  async options() {
    const response = await apiClient.get('/freight-hirings/options')
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/freight-hirings/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/freight-hirings', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/freight-hirings/${id}`, payload)
    return response.data
  },

  async convertToTransportDocument(id) {
    const response = await apiClient.post(`/freight-hirings/${id}/convert-to-ot`, {})
    return response.data
  },
}

export default freightHiringService
