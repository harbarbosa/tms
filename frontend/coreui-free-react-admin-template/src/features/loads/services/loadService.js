import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const loadService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/loads', params))
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/loads/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/loads', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/loads/${id}`, payload)
    return response.data
  },

  async remove(id) {
    const response = await apiClient.delete(`/loads/${id}`)
    return response.data
  },

  async syncOrders(id, orderIds) {
    const response = await apiClient.post(`/loads/${id}/orders`, { order_ids: orderIds })
    return response.data
  },
}

export default loadService
