import apiClient from '../../../services/http/interceptors'
import { buildQueryPath, openProtectedFile } from '../../../services/http/serviceUtils'

const tripDocumentService = {
  async list(params) {
    const response = await apiClient.get(buildQueryPath('/trip-documents', params))
    return response.data
  },

  async options() {
    const response = await apiClient.get('/trip-documents/options')
    return response.data
  },

  async upload(formData) {
    const response = await apiClient.post('/trip-documents', formData)
    return response.data
  },

  async remove(id) {
    const response = await apiClient.delete(`/trip-documents/${id}`)
    return response.data
  },

  async openFile(id) {
    return openProtectedFile(`/trip-documents/${id}/view`, 'Nao foi possivel visualizar o arquivo.')
  },
}

export default tripDocumentService
