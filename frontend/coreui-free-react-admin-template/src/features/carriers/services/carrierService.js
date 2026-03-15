import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const carrierService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/carriers', params))
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/carriers/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/carriers', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/carriers/${id}`, payload)
    return response.data
  },

  async remove(id) {
    const response = await apiClient.delete(`/carriers/${id}`)
    return response.data
  },
}

export default carrierService
