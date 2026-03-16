import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const companyService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/companies', params))
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/companies/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/companies', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/companies/${id}`, payload)
    return response.data
  },

  async updateStatus(id, status) {
    const response = await apiClient.patch(`/companies/${id}/status`, { status })
    return response.data
  },
}

export default companyService
