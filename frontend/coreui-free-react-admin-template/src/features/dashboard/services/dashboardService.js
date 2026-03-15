import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const dashboardService = {
  async summary(params) {
    const response = await apiClient.get(buildQueryPath('/dashboard/summary', params))
    return response.data
  },

  async charts(params) {
    const response = await apiClient.get(buildQueryPath('/dashboard/charts', params))
    return response.data
  },

  async quickLists(params) {
    const response = await apiClient.get(buildQueryPath('/dashboard/quick-lists', params))
    return response.data
  },
}

export default dashboardService
