import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const userService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/users', params))
    return response.data
  },

  async options() {
    const response = await apiClient.get('/users/options')
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/users', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/users/${id}`, payload)
    return response.data
  },

  async updateStatus(id, status) {
    const response = await apiClient.patch(`/users/${id}/status`, { status })
    return response.data
  },

  async resetPassword(id) {
    const response = await apiClient.post(`/users/${id}/reset-password`, {})
    return response.data
  },
}

export default userService
