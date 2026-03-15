import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const incidentService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/incidents', params))
    return response.data
  },

  async options() {
    const response = await apiClient.get('/incidents/options')
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/incidents/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/incidents', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/incidents/${id}`, payload)
    return response.data
  },

  async remove(id) {
    const response = await apiClient.delete(`/incidents/${id}`)
    return response.data
  },
}

export default incidentService
