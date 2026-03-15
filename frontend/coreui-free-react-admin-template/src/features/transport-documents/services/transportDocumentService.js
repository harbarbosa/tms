import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const transportDocumentService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/transport-documents', params))
    return response.data
  },

  async options() {
    const response = await apiClient.get('/transport-documents/options')
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/transport-documents/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/transport-documents', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/transport-documents/${id}`, payload)
    return response.data
  },

  async remove(id) {
    const response = await apiClient.delete(`/transport-documents/${id}`)
    return response.data
  },
}

export default transportDocumentService
