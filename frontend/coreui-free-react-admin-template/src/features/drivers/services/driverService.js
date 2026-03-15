import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const driverService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/drivers', params))
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/drivers/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/drivers', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/drivers/${id}`, payload)
    return response.data
  },

  async remove(id) {
    const response = await apiClient.delete(`/drivers/${id}`)
    return response.data
  },
}

export default driverService
