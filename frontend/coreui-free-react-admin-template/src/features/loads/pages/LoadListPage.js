import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { CAlert } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import DeleteConfirmModal from '../../../components/crud/DeleteConfirmModal'
import loadService from '../services/loadService'
import LoadFilters from '../components/LoadFilters'
import LoadTable from '../components/LoadTable'

const defaultFilters = {
  search: '',
  origem: '',
  destino: '',
  status: '',
  data_inicio: '',
  data_fim: '',
  perPage: '10',
}

const LoadListPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [loads, setLoads] = useState([])
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0, pageCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadItems = async (page = 1, currentFilters = appliedFilters) => {
    setIsLoading(true)

    try {
      const response = await loadService.list({
        ...currentFilters,
        page,
        perPage: currentFilters.perPage,
      })
      setLoads(response.items || [])
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

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const handleSearch = () => {
    setAppliedFilters(filters)
  }

  const handleReset = () => {
    setFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
  }

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setIsDeleting(true)

    try {
      await loadService.remove(deleteTarget.id)
      setFeedback('Carga excluida com sucesso.')
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
        title="Cargas"
        description="Consolidacao profissional de pedidos de transporte em cargas planejadas e operacionais."
        createPath="/operations/loads/new"
        createLabel="Nova carga"
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <LoadFilters filters={filters} onChange={handleFilterChange} onSearch={handleSearch} onReset={handleReset} />
      {isLoading ? (
        <CAlert color="info">Carregando cargas...</CAlert>
      ) : (
        <>
          <LoadTable items={loads} onDelete={setDeleteTarget} />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadItems(page, appliedFilters)} />
        </>
      )}
      <DeleteConfirmModal
        visible={Boolean(deleteTarget)}
        title="Excluir carga"
        message={`Deseja realmente excluir a carga ${deleteTarget?.codigo_carga || ''}?`}
        isSubmitting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default LoadListPage
