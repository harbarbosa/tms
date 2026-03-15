import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { CAlert } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import deliveryTrackingService from '../services/deliveryTrackingService'
import DeliveryTrackingFilters from '../components/DeliveryTrackingFilters'
import DeliveryTrackingTable from '../components/DeliveryTrackingTable'

const defaultFilters = {
  search: '',
  status: '',
  perPage: '10',
}

const DeliveryTrackingListPage = () => {
  const dispatch = useDispatch()
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0, pageCount: 0 })
  const [isLoading, setIsLoading] = useState(true)

  const loadItems = async (page = 1, currentFilters = appliedFilters) => {
    setIsLoading(true)

    try {
      const response = await deliveryTrackingService.list({
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

  return (
    <>
      <CrudPageHeader
        title="Rastreamento de Entrega"
        description="Acompanhe o andamento das viagens, eventos operacionais e o historico completo por ordem de transporte."
        createPath="/execution/incidents/new"
        createLabel="Nova ocorrencia"
      />
      <DeliveryTrackingFilters
        filters={filters}
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
        <CAlert color="info">Carregando rastreamentos...</CAlert>
      ) : (
        <>
          <DeliveryTrackingTable items={items} />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={(page) => loadItems(page, appliedFilters)} />
        </>
      )}
    </>
  )
}

export default DeliveryTrackingListPage
