import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import useAuthorization from '../../../hooks/useAuthorization'
import authService from '../../../services/auth/authService'
import permissionService from '../services/permissionService'
import PermissionMatrixFilters from '../components/PermissionMatrixFilters'
import PermissionMatrixTable from '../components/PermissionMatrixTable'

const PermissionMatrixPage = () => {
  const dispatch = useDispatch()
  const { hasPermission, user } = useAuthorization()
  const [filters, setFilters] = useState({ role_id: '', module: '' })
  const [appliedFilters, setAppliedFilters] = useState({ role_id: '', module: '' })
  const [roles, setRoles] = useState([])
  const [actions, setActions] = useState([])
  const [modules, setModules] = useState([])
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  const canManage = hasPermission('permissions.manage')

  const loadMatrix = async (currentFilters = appliedFilters) => {
    setIsLoading(true)

    try {
      const response = await permissionService.matrix({
        role_id: currentFilters.role_id || undefined,
        module: currentFilters.module || undefined,
      })

      setRoles(response.roles || [])
      setActions(response.actions || [])
      setModules(response.modules || [])
      setSelectedRole(response.selected_role || null)

      const assignedIds = []
      ;(response.modules || []).forEach((moduleRow) => {
        Object.values(moduleRow.actions || {}).forEach((permission) => {
          if (permission?.assigned) {
            assignedIds.push(permission.id)
          }
        })
      })

      setSelectedPermissionIds(Array.from(new Set(assignedIds)))

      if (!currentFilters.role_id && response.selected_role_id) {
        const roleId = String(response.selected_role_id)
        setFilters((current) => ({ ...current, role_id: roleId }))
        setAppliedFilters((current) => ({ ...current, role_id: roleId }))
      }
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMatrix(appliedFilters)
  }, [appliedFilters.role_id, appliedFilters.module])

  const togglePermission = (permissionId) => {
    setSelectedPermissionIds((current) =>
      current.includes(permissionId) ? current.filter((id) => id !== permissionId) : [...current, permissionId],
    )
  }

  const hasChanges = useMemo(() => {
    const assignedIds = []
    modules.forEach((moduleRow) => {
      Object.values(moduleRow.actions || {}).forEach((permission) => {
        if (permission?.assigned) {
          assignedIds.push(permission.id)
        }
      })
    })

    const base = Array.from(new Set(assignedIds)).sort((a, b) => a - b)
    const current = [...selectedPermissionIds].sort((a, b) => a - b)

    return JSON.stringify(base) !== JSON.stringify(current)
  }, [modules, selectedPermissionIds])

  const handleSave = async () => {
    if (!selectedRole?.id) {
      return
    }

    setIsSaving(true)

    try {
      const response = await permissionService.saveRolePermissions(selectedRole.id, selectedPermissionIds)
      setActions(response.actions || [])
      setModules(response.modules || [])
      setSelectedRole(response.selected_role || selectedRole)

      const assignedIds = []
      ;(response.modules || []).forEach((moduleRow) => {
        Object.values(moduleRow.actions || {}).forEach((permission) => {
          if (permission?.assigned) {
            assignedIds.push(permission.id)
          }
        })
      })

      setSelectedPermissionIds(Array.from(new Set(assignedIds)))
      setFeedback('Matriz de permissoes salva com sucesso.')

      if (user?.role && response.selected_role?.slug === user.role) {
        const session = await authService.me()
        dispatch({ type: 'auth/bootstrapSuccess', payload: session })
      }
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <CrudPageHeader
        title="Permissoes"
        description="Edite a matriz de acesso por perfil, modulo e acao mantendo a integracao direta com os guards e com o menu do TMS."
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <PermissionMatrixFilters
        filters={filters}
        roles={roles}
        onChange={(event) => {
          const { name, value } = event.target
          setFilters((current) => ({ ...current, [name]: value }))
        }}
        onSearch={() => setAppliedFilters(filters)}
      />
      {selectedRole ? (
        <CAlert color="info">
          Perfil selecionado: <strong>{selectedRole.name}</strong>
        </CAlert>
      ) : null}
      {isLoading ? (
        <CAlert color="info">Carregando matriz de permissoes...</CAlert>
      ) : (
        <PermissionMatrixTable
          actions={actions}
          modules={modules}
          selectedPermissionIds={selectedPermissionIds}
          canManage={canManage}
          onToggle={togglePermission}
        />
      )}
      {canManage ? (
        <div className="mt-4 d-flex justify-content-end">
          <CButton color="primary" disabled={!selectedRole?.id || !hasChanges || isSaving} onClick={handleSave}>
            {isSaving ? 'Salvando...' : 'Salvar permissoes'}
          </CButton>
        </div>
      ) : null}
    </>
  )
}

export default PermissionMatrixPage
