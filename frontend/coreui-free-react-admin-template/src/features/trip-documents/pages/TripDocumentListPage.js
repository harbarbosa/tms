import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { CAlert } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import DeleteConfirmModal from '../../../components/crud/DeleteConfirmModal'
import tripDocumentService from '../services/tripDocumentService'
import TripDocumentFilters from '../components/TripDocumentFilters'
import TripDocumentTable from '../components/TripDocumentTable'

const TripDocumentListPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const preselectedTransportDocumentId = new URLSearchParams(location.search).get('ordem_transporte_id') || ''
  const defaultFilters = {
    search: '',
    tipo_documento: '',
    ordem_transporte_id: preselectedTransportDocumentId,
    perPage: '10',
  }

  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [options, setOptions] = useState({ transport_documents: [] })
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
        tripDocumentService.list({
          ...currentFilters,
          page,
          perPage: currentFilters.perPage,
        }),
        tripDocumentService.options(),
      ])
      setItems(response.items || [])
      setMeta(response.meta || { page, perPage: Number(currentFilters.perPage), total: 0, pageCount: 0 })
      setOptions({ transport_documents: loadedOptions.transport_documents || [] })
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
      await tripDocumentService.remove(deleteTarget.id)
      setFeedback('Documento removido com sucesso.')
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
        title="Documentos da Viagem"
        description="Gerencie CTe, MDFe, NF e demais anexos logísticos vinculados a ordem de transporte."
        createPath="/execution/trip-documents/new"
        createLabel="Novo documento"
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <TripDocumentFilters
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
        <CAlert color="info">Carregando documentos...</CAlert>
      ) : (
        <>
          <TripDocumentTable items={items} onPreview={tripDocumentService.openFile} onDelete={setDeleteTarget} />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadItems(page, appliedFilters)} />
        </>
      )}
      <DeleteConfirmModal
        visible={Boolean(deleteTarget)}
        title="Excluir documento"
        message={`Deseja realmente excluir o documento ${deleteTarget?.nome_arquivo_original || ''}?`}
        isSubmitting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default TripDocumentListPage
