import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const carrierPortalService = {
  async dashboard(params = {}) {
    const response = await apiClient.get(buildQueryPath('/carrier-portal/dashboard', params))
    return response.data
  },
}

export default carrierPortalService
