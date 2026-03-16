import { buildQueryPath, downloadProtectedFile } from '../../../services/http/serviceUtils'
import apiClient from '../../../services/http/interceptors'

const reportService = {
  async options() {
    return apiClient.get('/reports/options')
  },

  async fetch(reportKey, params) {
    return apiClient.get(buildQueryPath(`/reports/${reportKey}`, params))
  },

  async exportCsv(reportKey, params) {
    const queryPath = buildQueryPath(`/reports/${reportKey}/export`, { ...params, format: 'csv', page: 1, perPage: 1000 })
    await downloadProtectedFile(queryPath, `${reportKey}.csv`, 'Nao foi possivel exportar o relatorio em CSV.')
  },
}

export default reportService
