import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const vehicleService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/vehicles', params))
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/vehicles/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/vehicles', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/vehicles/${id}`, payload)
    return response.data
  },

  async remove(id) {
    const response = await apiClient.delete(`/vehicles/${id}`)
    return response.data
  },
}

export default vehicleService
