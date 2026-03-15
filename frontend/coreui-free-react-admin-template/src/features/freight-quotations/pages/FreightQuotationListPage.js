import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { CAlert } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import DeleteConfirmModal from '../../../components/crud/DeleteConfirmModal'
import useAuthorization from '../../../hooks/useAuthorization'
import freightQuotationService from '../services/freightQuotationService'
import FreightQuotationFilters from '../components/FreightQuotationFilters'
import FreightQuotationTable from '../components/FreightQuotationTable'

const defaultFilters = {
  search: '',
  tipo_referencia: '',
  status: '',
  data_envio_inicio: '',
  data_envio_fim: '',
  perPage: '10',
}

const FreightQuotationListPage = () => {
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
      const response = await freightQuotationService.list({
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
      await freightQuotationService.remove(deleteTarget.id)
      setFeedback('Cotacao excluida com sucesso.')
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
        title="Cotacao de Frete"
        description="Solicite, acompanhe e compare propostas comerciais a partir de pedidos ou cargas."
        createPath="/operations/freight-quotations/new"
        createLabel="Nova cotacao"
        canCreate={hasPermission('freight_quotations.create')}
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <FreightQuotationFilters
        filters={filters}
        onChange={handleFilterChange}
        onSearch={() => setAppliedFilters(filters)}
        onReset={() => {
          setFilters(defaultFilters)
          setAppliedFilters(defaultFilters)
        }}
      />
      {isLoading ? (
        <CAlert color="info">Carregando cotacoes...</CAlert>
      ) : (
        <>
          <FreightQuotationTable
            items={items}
            onDelete={setDeleteTarget}
            canEdit={hasPermission('freight_quotations.update')}
            canDelete={hasPermission('freight_quotations.delete')}
          />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadItems(page, appliedFilters)} />
        </>
      )}
      {hasPermission('freight_quotations.delete') ? (
        <DeleteConfirmModal
          visible={Boolean(deleteTarget)}
          title="Excluir cotacao"
          message={`Deseja realmente excluir esta cotacao de ${deleteTarget?.reference_summary?.label || ''}?`}
          isSubmitting={isDeleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  )
}

export default FreightQuotationListPage
