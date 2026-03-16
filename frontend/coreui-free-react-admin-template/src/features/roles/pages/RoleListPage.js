import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { CAlert } from '@coreui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import DeleteConfirmModal from '../../../components/crud/DeleteConfirmModal'
import useAuthorization from '../../../hooks/useAuthorization'
import RoleFilters from '../components/RoleFilters'
import RoleTable from '../components/RoleTable'
import roleService from '../services/roleService'

const defaultFilters = {
  search: '',
  status: '',
  scope: '',
  perPage: '10',
}

const RoleListPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = useAuthorization()
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0, pageCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [statusTarget, setStatusTarget] = useState(null)
  const [duplicateTarget, setDuplicateTarget] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async (page = 1, currentFilters = appliedFilters) => {
    setIsLoading(true)

    try {
      const response = await roleService.list({ ...currentFilters, page, perPage: currentFilters.perPage })
      setItems(response.items || [])
      setMeta(response.meta || { page, perPage: Number(currentFilters.perPage), total: 0, pageCount: 0 })
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData(1, appliedFilters)
  }, [appliedFilters])

  useEffect(() => {
    if (location.state?.feedback) {
      setFeedback(location.state.feedback)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const handleStatusUpdate = async () => {
    if (!statusTarget) return
    setIsSubmitting(true)
    try {
      const nextStatus = statusTarget.status === 'active' ? 'inactive' : 'active'
      await roleService.updateStatus(statusTarget.id, nextStatus)
      setFeedback(nextStatus === 'active' ? 'Perfil ativado com sucesso.' : 'Perfil inativado com sucesso.')
      setStatusTarget(null)
      loadData(meta.page, appliedFilters)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDuplicate = async () => {
    if (!duplicateTarget) return
    setIsSubmitting(true)
    try {
      await roleService.duplicate(duplicateTarget.id, {
        name: `${duplicateTarget.name} Copia`,
        description: duplicateTarget.description,
        scope: duplicateTarget.scope,
        status: 'active',
      })
      setFeedback('Perfil duplicado com sucesso.')
      setDuplicateTarget(null)
      loadData(meta.page, appliedFilters)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <CrudPageHeader
        title="Perfis"
        description="Administre os papeis de acesso do TMS, seus escopos e a base que sera usada na configuracao fina de permissoes."
        createPath="/admin/roles/new"
        createLabel="Novo perfil"
        canCreate={hasPermission('roles.manage')}
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <RoleFilters
        filters={filters}
        onChange={(event) => {
          const { name, value } = event.target
          setFilters((current) => ({ ...current, [name]: value }))
        }}
        onSearch={() => setAppliedFilters(filters)}
        onReset={() => {
          setFilters(defaultFilters)
          setAppliedFilters(defaultFilters)
        }}
      />
      {isLoading ? (
        <CAlert color="info">Carregando perfis...</CAlert>
      ) : (
        <>
          <RoleTable
            items={items}
            canManage={hasPermission('roles.manage')}
            onToggleStatus={setStatusTarget}
            onDuplicate={setDuplicateTarget}
          />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadData(page, appliedFilters)} />
        </>
      )}
      <DeleteConfirmModal
        visible={Boolean(statusTarget)}
        title={statusTarget?.status === 'active' ? 'Inativar perfil' : 'Ativar perfil'}
        message={`Deseja realmente ${statusTarget?.status === 'active' ? 'inativar' : 'ativar'} ${statusTarget?.name || 'este perfil'}?`}
        isSubmitting={isSubmitting}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleStatusUpdate}
        confirmLabel={statusTarget?.status === 'active' ? 'Inativar' : 'Ativar'}
        submittingLabel="Salvando..."
        confirmColor={statusTarget?.status === 'active' ? 'warning' : 'success'}
      />
      <DeleteConfirmModal
        visible={Boolean(duplicateTarget)}
        title="Duplicar perfil"
        message={`Deseja duplicar o perfil ${duplicateTarget?.name || ''} com suas permissoes atuais?`}
        isSubmitting={isSubmitting}
        onClose={() => setDuplicateTarget(null)}
        onConfirm={handleDuplicate}
        confirmLabel="Duplicar"
        submittingLabel="Duplicando..."
        confirmColor="dark"
      />
    </>
  )
}

export default RoleListPage
