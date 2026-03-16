import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const driverPortalService = {
  async dashboard(params = {}) {
    const response = await apiClient.get(buildQueryPath('/driver-portal/dashboard', params))
    return response.data
  },
}

export default driverPortalService
