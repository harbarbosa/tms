import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { CAlert } from '@coreui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import useAuthorization from '../../../hooks/useAuthorization'
import PickupScheduleFilters from '../components/PickupScheduleFilters'
import PickupScheduleTable from '../components/PickupScheduleTable'
import pickupScheduleService from '../services/pickupScheduleService'

const defaultFilters = {
  data_inicio: '',
  data_fim: '',
  transporter_id: '',
  status: '',
  unidade_origem: '',
  perPage: '10',
}

const PickupScheduleListPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = useAuthorization()
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [options, setOptions] = useState({ transporters: [], statusOptions: [], unitOptions: [] })
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0, pageCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')

  const loadData = async (page = 1, currentFilters = appliedFilters) => {
    setIsLoading(true)
    try {
      const [response, loadedOptions] = await Promise.all([
        pickupScheduleService.list({ ...currentFilters, page, perPage: currentFilters.perPage }),
        pickupScheduleService.options(),
      ])

      setItems(response.items || [])
      setMeta(response.meta || { page, perPage: Number(currentFilters.perPage), total: 0, pageCount: 0 })
      setOptions({
        transporters: loadedOptions.transporters || [],
        statusOptions: loadedOptions.statusOptions || [],
        unitOptions: loadedOptions.unitOptions || [],
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
        title="Agendamento de Coleta"
        description="Controle a janela operacional de coleta e expedicao por transportadora, unidade e ordem de transporte."
        createPath="/execution/pickup-schedules/new"
        createLabel="Novo agendamento"
        canCreate={hasPermission('pickup_schedules.create')}
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <PickupScheduleFilters
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
        <CAlert color="info">Carregando agendamentos...</CAlert>
      ) : (
        <>
          <PickupScheduleTable items={items} canEdit={hasPermission('pickup_schedules.update')} />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadData(page, appliedFilters)} />
        </>
      )}
    </>
  )
}

export default PickupScheduleListPage
