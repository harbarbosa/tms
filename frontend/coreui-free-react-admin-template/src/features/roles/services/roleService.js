import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const roleService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/roles', params))
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/roles/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/roles', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/roles/${id}`, payload)
    return response.data
  },

  async updateStatus(id, status) {
    const response = await apiClient.patch(`/roles/${id}/status`, { status })
    return response.data
  },

  async duplicate(id, payload) {
    const response = await apiClient.post(`/roles/${id}/duplicate`, payload)
    return response.data
  },
}

export default roleService
