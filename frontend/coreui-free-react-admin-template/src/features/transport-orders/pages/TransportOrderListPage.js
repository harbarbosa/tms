import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { CAlert } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import DeleteConfirmModal from '../../../components/crud/DeleteConfirmModal'
import transportOrderService from '../services/transportOrderService'
import TransportOrderFilters from '../components/TransportOrderFilters'
import TransportOrderTable from '../components/TransportOrderTable'

const defaultFilters = {
  search: '',
  status: '',
  data_prevista_entrega: '',
  perPage: '10',
}

const TransportOrderListPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0, pageCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadOrders = async (page = 1, currentFilters = appliedFilters) => {
    setIsLoading(true)

    try {
      const response = await transportOrderService.list({
        ...currentFilters,
        page,
        perPage: currentFilters.perPage,
      })
      setOrders(response.items || [])
      setMeta(response.meta || { page, perPage: Number(currentFilters.perPage), total: 0, pageCount: 0 })
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders(1, appliedFilters)
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
      await transportOrderService.remove(deleteTarget.id)
      setFeedback('Pedido de transporte excluido com sucesso.')
      setDeleteTarget(null)
      loadOrders(meta.page, appliedFilters)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <CrudPageHeader
        title="Pedidos de Transporte"
        description="Solicitacoes de transporte preparadas para evoluir para cargas, cotacao, OT e rastreamento."
        createPath="/operations/transport-orders/new"
        createLabel="Novo pedido"
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <TransportOrderFilters
        filters={filters}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
      />
      {isLoading ? (
        <CAlert color="info">Carregando pedidos de transporte...</CAlert>
      ) : (
        <>
          <TransportOrderTable items={orders} onDelete={setDeleteTarget} />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadOrders(page, appliedFilters)} />
        </>
      )}
      <DeleteConfirmModal
        visible={Boolean(deleteTarget)}
        title="Excluir pedido de transporte"
        message={`Deseja realmente excluir o pedido ${deleteTarget?.numero_pedido || ''}?`}
        isSubmitting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default TransportOrderListPage
