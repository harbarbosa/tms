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
import transportOrderService from '../services/transportOrderService'

const TransportOrderDetailsPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await transportOrderService.findById(id)
        setOrder(data)
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [dispatch, id])

  if (isLoading) {
    return <CAlert color="info">Carregando detalhes do pedido...</CAlert>
  }

  if (!order) {
    return <CAlert color="warning">Pedido de transporte nao encontrado.</CAlert>
  }

  return (
    <>
      <div className="mb-3 d-flex gap-2">
        <CButton color="secondary" variant="outline" as={Link} to="/operations/transport-orders">
          Voltar
        </CButton>
        <CButton color="info" variant="outline" as={Link} to={`/operations/transport-orders/${order.id}/edit`}>
          Editar pedido
        </CButton>
      </div>
      <CRow>
        <CCol lg={8}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>{order.numero_pedido}</span>
              <CrudStatusBadge status={order.status} />
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={6}>
                  <strong>Cliente</strong>
                  <div>{order.cliente_nome}</div>
                </CCol>
                <CCol md={6}>
                  <strong>Documento</strong>
                  <div>{order.documento_cliente || '-'}</div>
                </CCol>
                <CCol md={8}>
                  <strong>Endereco de entrega</strong>
                  <div>{`${order.endereco_entrega}, ${order.numero_entrega || 'S/N'}`}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Bairro</strong>
                  <div>{order.bairro_entrega || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Cidade/UF</strong>
                  <div>{`${order.cidade_entrega}/${order.estado_entrega}`}</div>
                </CCol>
                <CCol md={4}>
                  <strong>CEP</strong>
                  <div>{order.cep_entrega || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Entrega prevista</strong>
                  <div>{order.data_prevista_entrega}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Peso total</strong>
                  <div>{order.peso_total || '-'} kg</div>
                </CCol>
                <CCol md={4}>
                  <strong>Volume total</strong>
                  <div>{order.volume_total || '-'} m3</div>
                </CCol>
                <CCol md={4}>
                  <strong>Valor da mercadoria</strong>
                  <div>{order.valor_mercadoria || '-'}</div>
                </CCol>
                <CCol md={12}>
                  <strong>Observacoes</strong>
                  <div>{order.observacoes || '-'}</div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={4}>
          <CCard className="mb-4">
            <CCardHeader>Integracoes futuras</CCardHeader>
            <CCardBody>
              <CListGroup flush>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Cargas</span>
                  <span>{order.next_modules?.cargas ? 'Pronto' : 'Pendente'}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Cotacao</span>
                  <span>{order.next_modules?.cotacao ? 'Pronto' : 'Pendente'}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Ordem de transporte</span>
                  <span>{order.next_modules?.ordem_transporte ? 'Pronto' : 'Pendente'}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Rastreamento</span>
                  <span>{order.next_modules?.rastreamento ? 'Pronto' : 'Pendente'}</span>
                </CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default TransportOrderDetailsPage
