import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { CAlert } from '@coreui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import DeleteConfirmModal from '../../../components/crud/DeleteConfirmModal'
import useAuthorization from '../../../hooks/useAuthorization'
import CompanyFilters from '../components/CompanyFilters'
import CompanyTable from '../components/CompanyTable'
import companyService from '../services/companyService'

const defaultFilters = {
  search: '',
  status: '',
  tipo_empresa: '',
  cidade: '',
  perPage: '10',
}

const CompanyListPage = () => {
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
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const loadData = async (page = 1, currentFilters = appliedFilters) => {
    setIsLoading(true)

    try {
      const response = await companyService.list({
        ...currentFilters,
        page,
        perPage: currentFilters.perPage,
      })

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
    if (!statusTarget) {
      return
    }

    setIsUpdatingStatus(true)

    try {
      const nextStatus = statusTarget.status === 'active' ? 'inactive' : 'active'
      await companyService.updateStatus(statusTarget.id, nextStatus)
      setFeedback(nextStatus === 'active' ? 'Empresa ativada com sucesso.' : 'Empresa inativada com sucesso.')
      setStatusTarget(null)
      loadData(meta.page, appliedFilters)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <>
      <CrudPageHeader
        title="Empresas"
        description="Administre as empresas habilitadas no TMS, seus limites operacionais e o status de uso da plataforma."
        createPath="/admin/companies/new"
        createLabel="Nova empresa"
        canCreate={hasPermission('companies.manage')}
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <CompanyFilters
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
        <CAlert color="info">Carregando empresas...</CAlert>
      ) : (
        <>
          <CompanyTable
            items={items}
            canManage={hasPermission('companies.manage')}
            onToggleStatus={setStatusTarget}
          />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadData(page, appliedFilters)} />
        </>
      )}
      <DeleteConfirmModal
        visible={Boolean(statusTarget)}
        title={statusTarget?.status === 'active' ? 'Inativar empresa' : 'Ativar empresa'}
        message={`Deseja realmente ${statusTarget?.status === 'active' ? 'inativar' : 'ativar'} ${statusTarget?.razao_social || 'esta empresa'}?`}
        isSubmitting={isUpdatingStatus}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleStatusUpdate}
      />
    </>
  )
}

export default CompanyListPage
