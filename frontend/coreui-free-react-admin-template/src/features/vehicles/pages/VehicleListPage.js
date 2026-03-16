import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { CAlert } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudLoadingState from '../../../components/crud/CrudLoadingState'
import CrudPagination from '../../../components/crud/CrudPagination'
import DeleteConfirmModal from '../../../components/crud/DeleteConfirmModal'
import carrierService from '../../carriers/services/carrierService'
import vehicleService from '../services/vehicleService'
import VehicleFilters from '../components/VehicleFilters'
import VehicleTable from '../components/VehicleTable'

const defaultFilters = {
  search: '',
  transporter_id: '',
  tipo_veiculo: '',
  status: '',
  perPage: '10',
}

const VehicleListPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [vehicles, setVehicles] = useState([])
  const [carriers, setCarriers] = useState([])
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState([])
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0, pageCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadCarriers = async () => {
    try {
      const response = await carrierService.list({ page: 1, perPage: 100, status: '' })
      setCarriers(response.items || [])
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    }
  }

  const loadVehicles = async (page = 1, currentFilters = appliedFilters) => {
    setIsLoading(true)

    try {
      const response = await vehicleService.list({
        ...currentFilters,
        page,
        perPage: currentFilters.perPage,
      })
      setVehicles(response.items || [])
      setMeta(response.meta || { page, perPage: Number(currentFilters.perPage), total: 0, pageCount: 0 })
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCarriers()
    vehicleService
      .options()
      .then((response) => setVehicleTypeOptions(response.vehicleTypeOptions || []))
      .catch((error) => dispatch({ type: 'app/setError', payload: error.message }))
  }, [])

  useEffect(() => {
    loadVehicles(1, appliedFilters)
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
      await vehicleService.remove(deleteTarget.id)
      setFeedback('Veiculo excluido com sucesso.')
      setDeleteTarget(null)
      loadVehicles(meta.page, appliedFilters)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <CrudPageHeader
        title="Veiculos"
        description="Cadastro de veiculos vinculado a transportadoras e pronto para expansao."
        createPath="/registry/vehicles/new"
        createLabel="Novo veiculo"
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <VehicleFilters
        filters={filters}
        carriers={carriers}
        vehicleTypeOptions={vehicleTypeOptions}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
      />
      {isLoading ? (
        <CrudLoadingState message="Carregando veiculos..." />
      ) : (
        <>
          <VehicleTable items={vehicles} onDelete={setDeleteTarget} />
          <CrudPagination
            page={meta.page}
            pageCount={meta.pageCount}
            total={meta.total}
            perPage={meta.perPage}
            itemLabel="veiculos"
            onPageChange={(page) => loadVehicles(page, appliedFilters)}
          />
        </>
      )}
      <DeleteConfirmModal
        visible={Boolean(deleteTarget)}
        title="Excluir veiculo"
        message={`Deseja realmente excluir o veiculo ${deleteTarget?.placa || ''}?`}
        isSubmitting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default VehicleListPage
