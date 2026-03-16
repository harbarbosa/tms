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
import Can from '../../../components/guards/Can'
import freightHiringService from '../services/freightHiringService'

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const FreightHiringDetailsPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [hiring, setHiring] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [isConverting, setIsConverting] = useState(false)

  const loadHiring = async () => {
    try {
      const data = await freightHiringService.findById(id)
      setHiring(data)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHiring()
  }, [id])

  const handleConvert = async () => {
    setIsConverting(true)

    try {
      await freightHiringService.convertToTransportDocument(id)
      setFeedback('Ordem de transporte gerada com sucesso a partir da contratacao.')
      await loadHiring()
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsConverting(false)
    }
  }

  if (isLoading) {
    return <CAlert color="info">Carregando detalhes da contratacao...</CAlert>
  }

  if (!hiring) {
    return <CAlert color="warning">Contratacao nao encontrada.</CAlert>
  }

  return (
    <>
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <CButton color="secondary" variant="outline" as={Link} to="/operations/freight-hirings">
          Voltar
        </CButton>
        <Can permission="freight_hirings.update">
          <CButton color="info" variant="outline" as={Link} to={`/operations/freight-hirings/${hiring.id}/edit`}>
            Editar contratacao
          </CButton>
        </Can>
        {hiring.transport_document_id ? (
          <Can permission="transport_documents.view">
            <CButton color="dark" variant="outline" as={Link} to={`/operations/transport-documents/${hiring.transport_document_id}`}>
              Ver OT gerada
            </CButton>
          </Can>
        ) : null}
        {hiring.can_convert_to_ot ? (
          <Can permission="transport_documents.create">
            <CButton color="primary" onClick={handleConvert} disabled={isConverting}>
              {isConverting ? 'Gerando OT...' : 'Gerar ordem de transporte'}
            </CButton>
          </Can>
        ) : null}
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
              <span>Contratacao #{hiring.id}</span>
              <CrudStatusBadge status={hiring.status} />
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={4}>
                  <strong>Tipo de referencia</strong>
                  <div className="text-capitalize">{hiring.tipo_referencia}</div>
                </CCol>
                <CCol md={8}>
                  <strong>Referencia</strong>
                  <div>{hiring.reference_summary?.label || '-'}</div>
                  <small className="text-body-secondary">{hiring.reference_summary?.description || '-'}</small>
                </CCol>
                <CCol md={4}>
                  <strong>Cotacao</strong>
                  <div>#{hiring.freight_quotation_id}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Proposta aprovada</strong>
                  <div>#{hiring.freight_quotation_proposal_id}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Transportadora</strong>
                  <div>{hiring.transporter_name || hiring.proposal_summary?.transporter_name || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Valor contratado</strong>
                  <div>{formatCurrency(hiring.valor_contratado)}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Prazo de entrega</strong>
                  <div>{hiring.prazo_entrega_dias ? `${hiring.prazo_entrega_dias} dias` : '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Data da contratacao</strong>
                  <div>{new Date(hiring.data_contratacao).toLocaleString('pt-BR')}</div>
                </CCol>
                <CCol md={6}>
                  <strong>Contratado por</strong>
                  <div>{hiring.contratado_por || '-'}</div>
                </CCol>
                <CCol md={6}>
                  <strong>OT gerada</strong>
                  <div>{hiring.numero_ot || '-'}</div>
                </CCol>
                <CCol md={12}>
                  <strong>Condicoes comerciais</strong>
                  <div>{hiring.condicoes_comerciais || '-'}</div>
                </CCol>
                <CCol md={12}>
                  <strong>Observacoes</strong>
                  <div>{hiring.observacoes || '-'}</div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={4}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader>Resumo da proposta</CCardHeader>
            <CCardBody>
              <CListGroup flush>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Status da proposta</span>
                  <CrudStatusBadge status={hiring.proposal_summary?.status_resposta} />
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Valor aprovado</span>
                  <span>{formatCurrency(hiring.proposal_summary?.valor_frete)}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Prazo aprovado</span>
                  <span>
                    {hiring.proposal_summary?.prazo_entrega_dias
                      ? `${hiring.proposal_summary.prazo_entrega_dias} dias`
                      : '-'}
                  </span>
                </CListGroupItem>
                <CListGroupItem className="px-0">
                  <strong>Observacoes da proposta</strong>
                  <div className="mt-1">{hiring.proposal_summary?.observacoes || '-'}</div>
                </CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default FreightHiringDetailsPage
