import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const freightQuotationService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/freight-quotations', params))
    return response.data
  },

  async options() {
    const response = await apiClient.get('/freight-quotations/options')
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/freight-quotations/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/freight-quotations', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/freight-quotations/${id}`, payload)
    return response.data
  },

  async approveProposal(id, proposalId) {
    const response = await apiClient.post(`/freight-quotations/${id}/approve/${proposalId}`)
    return response.data
  },

  async remove(id) {
    const response = await apiClient.delete(`/freight-quotations/${id}`)
    return response.data
  },
}

export default freightQuotationService
