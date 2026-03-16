import apiClient from '../../../services/http/interceptors'
import { buildQueryPath } from '../../../services/http/serviceUtils'

const permissionService = {
  async matrix(params) {
    const response = await apiClient.get(buildQueryPath('/permissions/matrix', params))
    return response.data
  },

  async saveRolePermissions(roleId, permissionIds) {
    const response = await apiClient.put(`/permissions/roles/${roleId}`, {
      permission_ids: permissionIds,
    })
    return response.data
  },
}

export default permissionService
