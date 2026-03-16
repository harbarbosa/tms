import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { CAlert } from '@coreui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import useAuthorization from '../../../hooks/useAuthorization'
import FreightHiringFilters from '../components/FreightHiringFilters'
import FreightHiringTable from '../components/FreightHiringTable'
import freightHiringService from '../services/freightHiringService'

const defaultFilters = {
  search: '',
  status: '',
  tipo_referencia: '',
  transporter_id: '',
  data_inicio: '',
  data_fim: '',
  perPage: '10',
}

const FreightHiringListPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = useAuthorization()
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [options, setOptions] = useState({ transporters: [], statusOptions: [] })
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0, pageCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')

  const loadData = async (page = 1, currentFilters = appliedFilters) => {
    setIsLoading(true)
    try {
      const [response, loadedOptions] = await Promise.all([
        freightHiringService.list({ ...currentFilters, page, perPage: currentFilters.perPage }),
        freightHiringService.options(),
      ])

      setItems(response.items || [])
      setMeta(response.meta || { page, perPage: Number(currentFilters.perPage), total: 0, pageCount: 0 })
      setOptions({
        transporters: loadedOptions.transporters || [],
        statusOptions: loadedOptions.statusOptions || [],
      })
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

  return (
    <>
      <CrudPageHeader
        title="Contratacao de Frete"
        description="Formalize a contratacao apos a aprovacao comercial e mantenha o elo explicito entre cotacao, proposta e OT."
        createPath="/operations/freight-hirings/new"
        createLabel="Nova contratacao"
        canCreate={hasPermission('freight_hirings.create')}
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <FreightHiringFilters
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
        <CAlert color="info">Carregando contratacoes...</CAlert>
      ) : (
        <>
          <FreightHiringTable items={items} canEdit={hasPermission('freight_hirings.update')} />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadData(page, appliedFilters)} />
        </>
      )}
    </>
  )
}

export default FreightHiringListPage
