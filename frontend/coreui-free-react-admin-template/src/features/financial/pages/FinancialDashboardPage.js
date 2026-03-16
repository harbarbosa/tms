import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { CAlert } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import useAuthorization from '../../../hooks/useAuthorization'
import FinancialFilters from '../components/FinancialFilters'
import FinancialSummaryCards from '../components/FinancialSummaryCards'
import FinancialTable from '../components/FinancialTable'
import financialService from '../services/financialService'

const defaultFilters = {
  transporter_id: '',
  status: '',
  approval_pending: '',
  company_id: '',
  data_inicio: '',
  data_fim: '',
  perPage: '10',
}

const FinancialDashboardPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = useAuthorization()
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [options, setOptions] = useState({ transporters: [], companies: [], statusOptions: [] })
  const [summary, setSummary] = useState({})
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0, pageCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')

  const loadData = async (page = 1, currentFilters = appliedFilters) => {
    setIsLoading(true)
    try {
      const [loadedSummary, response, loadedOptions] = await Promise.all([
        financialService.summary(currentFilters),
        financialService.list({ ...currentFilters, page, perPage: currentFilters.perPage }),
        financialService.options(),
      ])

      setSummary(loadedSummary.cards || {})
      setItems(response.items || [])
      setMeta(response.meta || { page, perPage: Number(currentFilters.perPage), total: 0, pageCount: 0 })
      setOptions({
        transporters: loadedOptions.transporters || [],
        companies: loadedOptions.companies || [],
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
        title="Financeiro de Fretes"
        description="Controle a previsao, liberacao e pagamento dos fretes auditados com rastreabilidade financeira."
        createPath="/financial/new"
        createLabel="Novo lancamento"
        canCreate={hasPermission('financial.create')}
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <FinancialSummaryCards summary={summary} />
      <FinancialFilters
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
        <CAlert color="info">Carregando financeiro...</CAlert>
      ) : (
        <>
          <FinancialTable items={items} />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadData(page, appliedFilters)} />
        </>
      )}
    </>
  )
}

export default FinancialDashboardPage
