import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const vehicleCheckinService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/vehicle-checkins', params))
    return response.data
  },

  async options() {
    const response = await apiClient.get('/vehicle-checkins/options')
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/vehicle-checkins/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/vehicle-checkins', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/vehicle-checkins/${id}`, payload)
    return response.data
  },

  async registerEntry(id, payload = {}) {
    const response = await apiClient.post(`/vehicle-checkins/${id}/register-entry`, payload)
    return response.data
  },

  async registerExit(id, payload = {}) {
    const response = await apiClient.post(`/vehicle-checkins/${id}/register-exit`, payload)
    return response.data
  },
}

export default vehicleCheckinService
