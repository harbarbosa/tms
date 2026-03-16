import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const financialService = {
  async summary(params) {
    const response = await apiClient.get(buildQueryPath('/financial/summary', params))
    return response.data
  },

  async list(params) {
    const response = await apiClient.get(buildQueryPath('/financial', params))
    return response.data
  },

  async options() {
    const response = await apiClient.get('/financial/options')
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/financial/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/financial', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/financial/${id}`, payload)
    return response.data
  },

  async approve(id, payload) {
    const response = await apiClient.post(`/financial/${id}/approve`, payload)
    return response.data
  },

  async reject(id, payload) {
    const response = await apiClient.post(`/financial/${id}/reject`, payload)
    return response.data
  },

  async liberate(id) {
    const response = await apiClient.post(`/financial/${id}/liberate`, {})
    return response.data
  },

  async block(id, payload) {
    const response = await apiClient.post(`/financial/${id}/block`, payload)
    return response.data
  },

  async markPaid(id, payload) {
    const response = await apiClient.post(`/financial/${id}/mark-paid`, payload)
    return response.data
  },

  async cancel(id, payload) {
    const response = await apiClient.post(`/financial/${id}/cancel`, payload)
    return response.data
  },
}

export default financialService
