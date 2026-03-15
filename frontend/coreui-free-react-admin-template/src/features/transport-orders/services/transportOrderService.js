import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const transportOrderService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/transport-orders', params))
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/transport-orders/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/transport-orders', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/transport-orders/${id}`, payload)
    return response.data
  },

  async remove(id) {
    const response = await apiClient.delete(`/transport-orders/${id}`)
    return response.data
  },
}

export default transportOrderService
