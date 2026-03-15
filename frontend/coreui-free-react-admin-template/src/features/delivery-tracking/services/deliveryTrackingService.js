import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const deliveryTrackingService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/delivery-trackings', params))
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/delivery-trackings/${id}`)
    return response.data
  },

  async createEvent(id, payload) {
    const response = await apiClient.post(`/delivery-trackings/${id}/events`, payload)
    return response.data
  },
}

export default deliveryTrackingService
