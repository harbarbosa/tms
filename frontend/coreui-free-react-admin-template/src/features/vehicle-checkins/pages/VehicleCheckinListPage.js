import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { CAlert } from '@coreui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import useAuthorization from '../../../hooks/useAuthorization'
import VehicleCheckinFilters from '../components/VehicleCheckinFilters'
import VehicleCheckinTable from '../components/VehicleCheckinTable'
import vehicleCheckinService from '../services/vehicleCheckinService'

const defaultFilters = {
  status: '',
  data: '',
  transporter_id: '',
  vehicle_id: '',
  doca: '',
  perPage: '10',
}

const VehicleCheckinListPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = useAuthorization()
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [options, setOptions] = useState({ transporters: [], vehicles: [], statusOptions: [], dockOptions: [] })
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0, pageCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')

  const loadData = async (page = 1, currentFilters = appliedFilters) => {
    setIsLoading(true)
    try {
      const [response, loadedOptions] = await Promise.all([
        vehicleCheckinService.list({ ...currentFilters, page, perPage: currentFilters.perPage }),
        vehicleCheckinService.options(),
      ])

      setItems(response.items || [])
      setMeta(response.meta || { page, perPage: Number(currentFilters.perPage), total: 0, pageCount: 0 })
      setOptions({
        transporters: loadedOptions.transporters || [],
        vehicles: loadedOptions.vehicles || [],
        statusOptions: loadedOptions.statusOptions || [],
        dockOptions: loadedOptions.dockOptions || [],
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
        title="Check-in de Veiculo"
        description="Registre a chegada do veiculo, acompanhe entrada e saida da doca e mantenha o historico operacional do gate."
        createPath="/execution/vehicle-checkins/new"
        createLabel="Novo check-in"
        canCreate={hasPermission('vehicle_checkins.create')}
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <VehicleCheckinFilters
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
        <CAlert color="info">Carregando check-ins...</CAlert>
      ) : (
        <>
          <VehicleCheckinTable items={items} canEdit={hasPermission('vehicle_checkins.update')} />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadData(page, appliedFilters)} />
        </>
      )}
    </>
  )
}

export default VehicleCheckinListPage
