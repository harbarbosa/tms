import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { CAlert } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import DeleteConfirmModal from '../../../components/crud/DeleteConfirmModal'
import useAuthorization from '../../../hooks/useAuthorization'
import incidentService from '../services/incidentService'
import IncidentFilters from '../components/IncidentFilters'
import IncidentTable from '../components/IncidentTable'

const defaultFilters = {
  search: '',
  tipo_ocorrencia: '',
  status: '',
  perPage: '10',
}

const IncidentListPage = () => {
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
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadItems = async (page = 1, currentFilters = appliedFilters) => {
    setIsLoading(true)

    try {
      const response = await incidentService.list({
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
    loadItems(1, appliedFilters)
  }, [appliedFilters])

  useEffect(() => {
    if (location.state?.feedback) {
      setFeedback(location.state.feedback)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setIsDeleting(true)

    try {
      await incidentService.remove(deleteTarget.id)
      setFeedback('Ocorrencia excluida com sucesso.')
      setDeleteTarget(null)
      loadItems(meta.page, appliedFilters)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <CrudPageHeader
        title="Ocorrencias"
        description="Gerencie desvios operacionais com historico, status de tratativa e base preparada para fotos futuras."
        createPath="/execution/incidents/new"
        createLabel="Nova ocorrencia"
        canCreate={hasPermission('incidents.create')}
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <IncidentFilters
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
        <CAlert color="info">Carregando ocorrencias...</CAlert>
      ) : (
        <>
          <IncidentTable
            items={items}
            onDelete={setDeleteTarget}
            canEdit={hasPermission('incidents.update')}
            canDelete={hasPermission('incidents.delete')}
          />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadItems(page, appliedFilters)} />
        </>
      )}
      {hasPermission('incidents.delete') ? (
        <DeleteConfirmModal
          visible={Boolean(deleteTarget)}
          title="Excluir ocorrencia"
          message={`Deseja realmente excluir a ocorrencia ${deleteTarget?.tipo_ocorrencia || ''}?`}
          isSubmitting={isDeleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  )
}

export default IncidentListPage
