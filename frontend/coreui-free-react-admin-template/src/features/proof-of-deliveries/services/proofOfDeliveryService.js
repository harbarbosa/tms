import apiClient from '../../../services/http/interceptors'
import { buildQueryPath, openProtectedFile } from '../../../services/http/serviceUtils'

const proofOfDeliveryService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/proof-of-deliveries', params))
    return response.data
  },

  async options() {
    const response = await apiClient.get('/proof-of-deliveries/options')
    return response.data
  },

  async findById(id) {
    const response = await apiClient.get(`/proof-of-deliveries/${id}`)
    return response.data
  },

  async create(formData) {
    const response = await apiClient.post('/proof-of-deliveries', formData)
    return response.data
  },

  async update(id, formData) {
    const response = await apiClient.post(`/proof-of-deliveries/${id}`, formData)
    return response.data
  },

  async openFile(id) {
    return openProtectedFile(`/proof-of-deliveries/${id}/view`, 'Nao foi possivel visualizar o comprovante.')
  },
}

export default proofOfDeliveryService
