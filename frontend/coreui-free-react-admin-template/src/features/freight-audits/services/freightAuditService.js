import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const freightAuditService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/freight-audits', params))
    return response.data
  },

  async options() {
    const response = await apiClient.get('/freight-audits/options')
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/freight-audits/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/freight-audits', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/freight-audits/${id}`, payload)
    return response.data
  },
}

export default freightAuditService
