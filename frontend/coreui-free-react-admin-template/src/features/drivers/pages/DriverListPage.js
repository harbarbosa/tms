import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { CAlert } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import DeleteConfirmModal from '../../../components/crud/DeleteConfirmModal'
import driverService from '../services/driverService'
import carrierService from '../../carriers/services/carrierService'
import DriverFilters from '../components/DriverFilters'
import DriverTable from '../components/DriverTable'

const defaultFilters = {
  search: '',
  transporter_id: '',
  status: '',
  perPage: '10',
}

const DriverListPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [drivers, setDrivers] = useState([])
  const [carriers, setCarriers] = useState([])
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

  const loadDrivers = async (page = 1, currentFilters = appliedFilters) => {
    setIsLoading(true)

    try {
      const response = await driverService.list({
        ...currentFilters,
        page,
        perPage: currentFilters.perPage,
      })
      setDrivers(response.items || [])
      setMeta(response.meta || { page, perPage: Number(currentFilters.perPage), total: 0, pageCount: 0 })
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCarriers()
  }, [])

  useEffect(() => {
    loadDrivers(1, appliedFilters)
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
      await driverService.remove(deleteTarget.id)
      setFeedback('Motorista excluido com sucesso.')
      setDeleteTarget(null)
      loadDrivers(meta.page, appliedFilters)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <CrudPageHeader
        title="Motoristas"
        description="Cadastro operacional de motoristas vinculado a transportadoras."
        createPath="/registry/drivers/new"
        createLabel="Novo motorista"
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <DriverFilters
        filters={filters}
        carriers={carriers}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
      />
      {isLoading ? (
        <CAlert color="info">Carregando motoristas...</CAlert>
      ) : (
        <>
          <DriverTable items={drivers} onDelete={setDeleteTarget} />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadDrivers(page, appliedFilters)} />
        </>
      )}
      <DeleteConfirmModal
        visible={Boolean(deleteTarget)}
        title="Excluir motorista"
        message={`Deseja realmente excluir ${deleteTarget?.nome || 'este motorista'}?`}
        isSubmitting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default DriverListPage
