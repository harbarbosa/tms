import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CListGroup,
  CListGroupItem,
  CRow,
} from '@coreui/react'
import CrudStatusBadge from '../../../components/crud/CrudStatusBadge'
import loadService from '../services/loadService'
import LoadOrderAssignment from '../components/LoadOrderAssignment'

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const LoadDetailsPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [load, setLoad] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [isSavingOrders, setIsSavingOrders] = useState(false)

  const fetchLoad = async () => {
    try {
      const data = await loadService.findById(id)
      setLoad(data)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLoad()
  }, [id])

  const handleSaveOrders = async (orderIds) => {
    setIsSavingOrders(true)

    try {
      await loadService.syncOrders(id, orderIds)
      setFeedback('Pedidos vinculados a carga com sucesso.')
      await fetchLoad()
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsSavingOrders(false)
    }
  }

  if (isLoading) {
    return <CAlert color="info">Carregando detalhes da carga...</CAlert>
  }

  if (!load) {
    return <CAlert color="warning">Carga nao encontrada.</CAlert>
  }

  return (
    <>
      <div className="mb-3 d-flex gap-2">
        <CButton color="secondary" variant="outline" as={Link} to="/operations/loads">
          Voltar
        </CButton>
        <CButton color="info" variant="outline" as={Link} to={`/operations/loads/${load.id}/edit`}>
          Editar carga
        </CButton>
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      <CRow className="g-4">
        <CCol lg={8}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>{load.codigo_carga}</span>
              <CrudStatusBadge status={load.status} />
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={6}>
                  <strong>Origem</strong>
                  <div>{load.origem_nome}</div>
                  <small className="text-body-secondary">
                    {load.origem_cidade}/{load.origem_estado}
                  </small>
                </CCol>
                <CCol md={6}>
                  <strong>Destino</strong>
                  <div>{load.destino_nome}</div>
                  <small className="text-body-secondary">
                    {load.destino_cidade}/{load.destino_estado}
                  </small>
                </CCol>
                <CCol md={4}>
                  <strong>Saida prevista</strong>
                  <div>{load.data_prevista_saida}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Entrega prevista</strong>
                  <div>{load.data_prevista_entrega}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Pedidos vinculados</strong>
                  <div>{load.orders?.length || 0}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Peso total</strong>
                  <div>{load.peso_total || 0} kg</div>
                </CCol>
                <CCol md={4}>
                  <strong>Volume total</strong>
                  <div>{load.volume_total || 0} m3</div>
                </CCol>
                <CCol md={4}>
                  <strong>Valor total</strong>
                  <div>{formatCurrency(load.valor_total)}</div>
                </CCol>
                <CCol md={12}>
                  <strong>Observacoes</strong>
                  <div>{load.observacoes || '-'}</div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
          <LoadOrderAssignment load={load} isSaving={isSavingOrders} onSave={handleSaveOrders} />
        </CCol>
        <CCol lg={4}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader>Pedidos atualmente na carga</CCardHeader>
            <CCardBody>
              <CListGroup flush>
                {(load.orders || []).length === 0 ? (
                  <CListGroupItem className="px-0 text-body-secondary">
                    Nenhum pedido vinculado ate o momento.
                  </CListGroupItem>
                ) : (
                  load.orders.map((order) => (
                    <CListGroupItem key={order.id} className="px-0">
                      <div className="fw-semibold">{order.numero_pedido}</div>
                      <div>{order.cliente_nome}</div>
                      <small className="text-body-secondary">
                        {order.cidade_entrega}/{order.estado_entrega}
                      </small>
                    </CListGroupItem>
                  ))
                )}
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default LoadDetailsPage
