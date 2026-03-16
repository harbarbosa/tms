import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { CAlert } from '@coreui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudLoadingState from '../../../components/crud/CrudLoadingState'
import CrudPagination from '../../../components/crud/CrudPagination'
import DeleteConfirmModal from '../../../components/crud/DeleteConfirmModal'
import useAuthorization from '../../../hooks/useAuthorization'
import CarrierFilters from '../components/CarrierFilters'
import CarrierTable from '../components/CarrierTable'
import carrierService from '../services/carrierService'

const defaultFilters = {
  search: '',
  status: '',
  perPage: '10',
}

const CarrierListPage = () => {
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

  const loadData = async (page = 1, currentFilters = appliedFilters) => {
    setIsLoading(true)

    try {
      const response = await carrierService.list({
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
      await carrierService.remove(deleteTarget.id)
      setFeedback('Transportadora excluida com sucesso.')
      setDeleteTarget(null)
      loadData(meta.page, appliedFilters)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <CrudPageHeader
        title="Transportadoras"
        description="Modulo piloto do padrao de CRUD reutilizavel para cadastros do TMS."
        createPath="/registry/carriers/new"
        createLabel="Nova transportadora"
        canCreate={hasPermission('carriers.create')}
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <CarrierFilters
        filters={filters}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
      />
      {isLoading ? (
        <CrudLoadingState message="Carregando transportadoras..." />
      ) : (
        <>
          <CarrierTable
            items={items}
            onDelete={setDeleteTarget}
            canEdit={hasPermission('carriers.update')}
            canDelete={hasPermission('carriers.delete')}
          />
          <CrudPagination
            page={meta.page}
            pageCount={meta.pageCount}
            total={meta.total}
            perPage={meta.perPage}
            itemLabel="transportadoras"
            onPageChange={(page) => loadData(page, appliedFilters)}
          />
        </>
      )}
      <DeleteConfirmModal
        visible={Boolean(deleteTarget)}
        title="Excluir transportadora"
        message={`Deseja realmente excluir ${deleteTarget?.razao_social || 'esta transportadora'}?`}
        isSubmitting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default CarrierListPage
