import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { CAlert } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CrudPagination from '../../../components/crud/CrudPagination'
import useAuthorization from '../../../hooks/useAuthorization'
import proofOfDeliveryService from '../services/proofOfDeliveryService'
import ProofOfDeliveryTable from '../components/ProofOfDeliveryTable'

const ProofOfDeliveryListPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = useAuthorization()
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, perPage: 10, total: 0, pageCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')

  const loadItems = async (page = 1) => {
    setIsLoading(true)

    try {
      const response = await proofOfDeliveryService.list({ page, perPage: 10 })
      setItems(response.items || [])
      setMeta(response.meta || { page, perPage: 10, total: 0, pageCount: 0 })
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems(1)
  }, [])

  useEffect(() => {
    if (location.state?.feedback) {
      setFeedback(location.state.feedback)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  return (
    <>
      <CrudPageHeader
        title="Comprovantes de Entrega"
        description="Consulte e mantenha os comprovantes digitais vinculados as ordens de transporte."
        createPath="/execution/proof-of-deliveries/new"
        createLabel="Novo comprovante"
        canCreate={hasPermission('proof_of_deliveries.create')}
      />
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      {isLoading ? (
        <CAlert color="info">Carregando comprovantes...</CAlert>
      ) : (
        <>
          <ProofOfDeliveryTable
            items={items}
            onPreview={proofOfDeliveryService.openFile}
            canEdit={hasPermission('proof_of_deliveries.update')}
          />
          <CrudPagination page={meta.page} pageCount={meta.pageCount} onPageChange={loadItems} />
        </>
      )}
    </>
  )
}

export default ProofOfDeliveryListPage
