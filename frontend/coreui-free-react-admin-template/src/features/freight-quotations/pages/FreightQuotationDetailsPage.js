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
import useAuthorization from '../../../hooks/useAuthorization'
import freightQuotationService from '../services/freightQuotationService'
import FreightProposalComparison from '../components/FreightProposalComparison'

const FreightQuotationDetailsPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { hasPermission } = useAuthorization()
  const [quotation, setQuotation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [approvingId, setApprovingId] = useState(null)

  const loadQuotation = async () => {
    try {
      const data = await freightQuotationService.findById(id)
      setQuotation(data)
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadQuotation()
  }, [id])

  const handleApprove = async (proposalId) => {
    setApprovingId(proposalId)

    try {
      await freightQuotationService.approveProposal(id, proposalId)
      setFeedback('Proposta aprovada com sucesso.')
      await loadQuotation()
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setApprovingId(null)
    }
  }

  if (isLoading) {
    return <CAlert color="info">Carregando acompanhamento da cotacao...</CAlert>
  }

  if (!quotation) {
    return <CAlert color="warning">Cotacao nao encontrada.</CAlert>
  }

  return (
    <>
      <div className="mb-3 d-flex gap-2">
        <CButton color="secondary" variant="outline" as={Link} to="/operations/freight-quotations">
          Voltar
        </CButton>
        <Can permission="freight_quotations.update">
          <CButton color="info" variant="outline" as={Link} to={`/operations/freight-quotations/${quotation.id}/edit`}>
            Editar cotacao
          </CButton>
        </Can>
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
              <span>{quotation.reference_summary?.label || `Cotacao #${quotation.id}`}</span>
              <CrudStatusBadge status={quotation.status} />
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={4}>
                  <strong>Tipo referencia</strong>
                  <div className="text-capitalize">{quotation.tipo_referencia}</div>
                </CCol>
                <CCol md={8}>
                  <strong>Descricao</strong>
                  <div>{quotation.reference_summary?.description || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Data envio</strong>
                  <div>{quotation.data_envio}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Limite resposta</strong>
                  <div>{quotation.data_limite_resposta}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Propostas recebidas</strong>
                  <div>{quotation.proposals?.length || 0}</div>
                </CCol>
                <CCol md={12}>
                  <strong>Observacoes</strong>
                  <div>{quotation.observacoes || '-'}</div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
          <FreightProposalComparison
            proposals={quotation.proposals || []}
            quotationStatus={quotation.status}
            approvingId={approvingId}
            onApprove={handleApprove}
            canApprove={hasPermission('freight_quotations.approve')}
          />
        </CCol>
        <CCol lg={4}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader>Acompanhamento</CCardHeader>
            <CCardBody>
              <CListGroup flush>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Status da referencia</span>
                  <CrudStatusBadge status={quotation.reference_summary?.status} />
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Status da cotacao</span>
                  <CrudStatusBadge status={quotation.status} />
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Total de propostas</span>
                  <span>{quotation.proposals?.length || 0}</span>
                </CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default FreightQuotationDetailsPage
