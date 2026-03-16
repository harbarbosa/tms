import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const pickupScheduleService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/pickup-schedules', params))
    return response.data
  },

  async options() {
    const response = await apiClient.get('/pickup-schedules/options')
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/pickup-schedules/${id}`)
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post('/pickup-schedules', payload)
    return response.data
  },

  async update(id, payload) {
    const response = await apiClient.put(`/pickup-schedules/${id}`, payload)
    return response.data
  },
}

export default pickupScheduleService
