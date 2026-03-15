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
import transportDocumentService from '../services/transportDocumentService'

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const TransportDocumentDetailsPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [document, setDocument] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const data = await transportDocumentService.findById(id)
        setDocument(data)
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocument()
  }, [dispatch, id])

  if (isLoading) {
    return <CAlert color="info">Carregando detalhes da OT...</CAlert>
  }

  if (!document) {
    return <CAlert color="warning">Ordem de transporte nao encontrada.</CAlert>
  }

  return (
    <>
      <div className="mb-3 d-flex gap-2">
        <CButton color="secondary" variant="outline" as={Link} to="/operations/transport-documents">
          Voltar
        </CButton>
        <CButton color="info" variant="outline" as={Link} to={`/operations/transport-documents/${document.id}/edit`}>
          Editar OT
        </CButton>
        <CButton color="primary" variant="outline" as={Link} to={`/execution/delivery-tracking/${document.id}`}>
          Ver rastreamento
        </CButton>
        <CButton color="warning" variant="outline" as={Link} to={`/execution/incidents/new?transport_document_id=${document.id}`}>
          Nova ocorrencia
        </CButton>
        <CButton color="dark" variant="outline" as={Link} to={`/execution/trip-documents?ordem_transporte_id=${document.id}`}>
          Documentos
        </CButton>
        <CButton color="success" variant="outline" as={Link} to={`/execution/proof-of-deliveries/new?ordem_transporte_id=${document.id}`}>
          Comprovante
        </CButton>
      </div>
      <CRow className="g-4">
        <CCol lg={8}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>{document.numero_ot}</span>
              <CrudStatusBadge status={document.status} />
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={4}>
                  <strong>Carga</strong>
                  <div>{document.codigo_carga || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Pedido</strong>
                  <div>{document.numero_pedido || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Transportadora</strong>
                  <div>{document.transporter_name}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Motorista</strong>
                  <div>{document.driver_name || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Veiculo</strong>
                  <div>{document.vehicle_plate || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Valor contratado</strong>
                  <div>{document.valor_frete_contratado ? formatCurrency(document.valor_frete_contratado) : '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Coleta prevista</strong>
                  <div>{document.data_coleta_prevista}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Entrega prevista</strong>
                  <div>{document.data_entrega_prevista}</div>
                </CCol>
                <CCol md={12}>
                  <strong>Observacoes</strong>
                  <div>{document.observacoes || '-'}</div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={4}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader>Proximos modulos</CCardHeader>
            <CCardBody>
              <CListGroup flush>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Rastreamento</span>
                  <span>{document.next_modules?.rastreamento ? 'Pronto' : 'Pendente'}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Comprovante de entrega</span>
                  <span>{document.next_modules?.comprovante_entrega ? 'Pronto' : 'Pendente'}</span>
                </CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default TransportDocumentDetailsPage
