import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { CAlert } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import DeleteConfirmModal from '../../../components/crud/DeleteConfirmModal'
import useAuthorization from '../../../hooks/useAuthorization'
import transportDocumentService from '../services/transportDocumentService'
import TransportDocumentFilters from '../components/TransportDocumentFilters'
import TransportDocumentTable from '../components/TransportDocumentTable'

const defaultFilters = {
  search: '',
  transporter_id: '',
  status: '',
  carga_id: '',
  pedido_id: '',
  perPage: '10',
}

const emptyOptions = {
  transporters: [],
  loads: [],
  transport_orders: [],
}

const TransportDocumentListPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = useAuthorization()
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [options, setOptions] = useState(emptyOptions)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0, pageCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadItems = async (page = 1, currentFilters = appliedFilters) => {
    setIsLoading(true)

    try {
      const [response, loadedOptions] = await Promise.all([
        transportDocumentService.list({
          ...currentFilters,
          page,
          perPage: currentFilters.perPage,
        }),
        transportDocumentService.options(),
      ])

      setItems(response.items || [])
      setMeta(response.meta || { page, perPage: Number(currentFilters.perPage), total: 0, pageCount: 0 })
      setOptions({
        transporters: loadedOptions.transporters || [],
        loads: loadedOptions.loads || [],
        transport_orders: loadedOptions.transport_orders || [],
      })
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

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setIsDeleting(true)

    try {
      await transportDocumentService.remove(deleteTarget.id)
      setFeedback('Ordem de transporte excluida com sucesso.')
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
        title="Ordens de Transporte"
        description="Formalizacao operacional do frete contratado, pronta para rastreamento e comprovante de entrega."
        createPath="/operations/transport-documents/new"
        createLabel="Nova OT"
        canCreate={hasPermission('transport_documents.create')}
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <TransportDocumentFilters
        filters={filters}
        options={options}
        onChange={handleFilterChange}
        onSearch={() => setAppliedFilters(filters)}
        onReset={() => {
          setFilters(defaultFilters)
          setAppliedFilters(defaultFilters)
        }}
      />
      {isLoading ? (
        <CAlert color="info">Carregando ordens de transporte...</CAlert>
      ) : (
        <>
          <TransportDocumentTable
            items={items}
            onDelete={setDeleteTarget}
            canEdit={hasPermission('transport_documents.update')}
            canDelete={hasPermission('transport_documents.delete')}
          />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadItems(page, appliedFilters)} />
        </>
      )}
      {hasPermission('transport_documents.delete') ? (
        <DeleteConfirmModal
          visible={Boolean(deleteTarget)}
          title="Excluir ordem de transporte"
          message={`Deseja realmente excluir a OT ${deleteTarget?.numero_ot || ''}?`}
          isSubmitting={isDeleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  )
}

export default TransportDocumentListPage
