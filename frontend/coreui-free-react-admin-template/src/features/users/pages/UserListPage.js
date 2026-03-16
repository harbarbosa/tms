import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { CAlert } from '@coreui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import DeleteConfirmModal from '../../../components/crud/DeleteConfirmModal'
import useAuthorization from '../../../hooks/useAuthorization'
import UserFilters from '../components/UserFilters'
import UserTable from '../components/UserTable'
import userService from '../services/userService'

const defaultFilters = {
  search: '',
  company_id: '',
  role_id: '',
  status: '',
  perPage: '10',
}

const UserListPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = useAuthorization()
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [options, setOptions] = useState({ companies: [], roles: [] })
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0, pageCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [statusTarget, setStatusTarget] = useState(null)
  const [resetTarget, setResetTarget] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async (page = 1, currentFilters = appliedFilters) => {
    setIsLoading(true)

    try {
      const [response, loadedOptions] = await Promise.all([
        userService.list({ ...currentFilters, page, perPage: currentFilters.perPage }),
        userService.options(),
      ])

      setItems(response.items || [])
      setMeta(response.meta || { page, perPage: Number(currentFilters.perPage), total: 0, pageCount: 0 })
      setOptions(loadedOptions || { companies: [], roles: [] })
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
      await userService.updateStatus(statusTarget.id, nextStatus)
      setFeedback(nextStatus === 'active' ? 'Usuario ativado com sucesso.' : 'Usuario inativado com sucesso.')
      setStatusTarget(null)
      loadData(meta.page, appliedFilters)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetTarget) return
    setIsSubmitting(true)
    try {
      const response = await userService.resetPassword(resetTarget.id)
      setFeedback(`Senha redefinida com sucesso. Senha temporaria: ${response.temporary_password}`)
      setResetTarget(null)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <CrudPageHeader
        title="Usuarios"
        description="Gerencie acessos, vinculos com empresas e perfis operacionais do TMS."
        createPath="/admin/users/new"
        createLabel="Novo usuario"
        canCreate={hasPermission('users.manage')}
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <UserFilters
        filters={filters}
        options={options}
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
        <CAlert color="info">Carregando usuarios...</CAlert>
      ) : (
        <>
          <UserTable
            items={items}
            canManage={hasPermission('users.manage')}
            onToggleStatus={setStatusTarget}
            onResetPassword={setResetTarget}
          />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadData(page, appliedFilters)} />
        </>
      )}
      <DeleteConfirmModal
        visible={Boolean(statusTarget)}
        title={statusTarget?.status === 'active' ? 'Inativar usuario' : 'Ativar usuario'}
        message={`Deseja realmente ${statusTarget?.status === 'active' ? 'inativar' : 'ativar'} ${statusTarget?.name || 'este usuario'}?`}
        isSubmitting={isSubmitting}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleStatusUpdate}
        confirmLabel={statusTarget?.status === 'active' ? 'Inativar' : 'Ativar'}
        submittingLabel="Salvando..."
        confirmColor={statusTarget?.status === 'active' ? 'warning' : 'success'}
      />
      <DeleteConfirmModal
        visible={Boolean(resetTarget)}
        title="Redefinir senha"
        message={`Deseja gerar uma nova senha temporaria para ${resetTarget?.name || 'este usuario'}?`}
        isSubmitting={isSubmitting}
        onClose={() => setResetTarget(null)}
        onConfirm={handleResetPassword}
        confirmLabel="Gerar nova senha"
        submittingLabel="Gerando..."
        confirmColor="dark"
      />
    </>
  )
}

export default UserListPage
