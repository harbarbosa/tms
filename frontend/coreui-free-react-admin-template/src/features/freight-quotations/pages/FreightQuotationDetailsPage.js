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
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
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
  const { hasPermission, role, scope } = useAuthorization()
  const [quotation, setQuotation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [approvingId, setApprovingId] = useState(null)
  const [responseForm, setResponseForm] = useState({
    status_resposta: 'respondida',
    valor_frete: '',
    prazo_entrega_dias: '',
    observacoes: '',
  })
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)
  const approvedProposal = (quotation?.proposals || []).find((proposal) => proposal.status_resposta === 'aprovada')
  const carrierProposal = (quotation?.proposals || []).find(
    (proposal) => Number(proposal.transporter_id) === Number(scope?.carrier_id),
  )
  const isCarrierPortal = role === 'carrier'

  const loadQuotation = async () => {
    try {
      const data = await freightQuotationService.findById(id)
      setQuotation(data)
      const proposal = (data?.proposals || []).find(
        (item) => Number(item.transporter_id) === Number(scope?.carrier_id),
      )

      if (proposal) {
        setResponseForm({
          status_resposta: proposal.status_resposta === 'recusada' ? 'recusada' : 'respondida',
          valor_frete: proposal.valor_frete ? String(proposal.valor_frete) : '',
          prazo_entrega_dias: proposal.prazo_entrega_dias ? String(proposal.prazo_entrega_dias) : '',
          observacoes: proposal.observacoes || '',
        })
      }
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadQuotation()
  }, [id, scope?.carrier_id])

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

  const handleRespondProposal = async (event) => {
    event.preventDefault()

    if (!carrierProposal) {
      return
    }

    setIsSubmittingResponse(true)

    try {
      await freightQuotationService.respondProposal(id, carrierProposal.id, {
        status_resposta: responseForm.status_resposta,
        valor_frete: responseForm.status_resposta === 'respondida' ? responseForm.valor_frete : null,
        prazo_entrega_dias:
          responseForm.status_resposta === 'respondida' ? responseForm.prazo_entrega_dias : null,
        observacoes: responseForm.observacoes,
      })
      setFeedback('Proposta enviada com sucesso.')
      await loadQuotation()
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsSubmittingResponse(false)
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
        {quotation.approved_hiring_id ? (
          <CButton
            color="dark"
            variant="outline"
            as={Link}
            to={`/operations/freight-hirings/${quotation.approved_hiring_id}`}
          >
            Ver contratacao
          </CButton>
        ) : null}
        {quotation.status === 'aprovada' && approvedProposal && !quotation.approved_hiring_id && hasPermission('freight_hirings.create') ? (
          <CButton
            color="primary"
            variant="outline"
            as={Link}
            to={`/operations/freight-hirings/new?quotation_id=${quotation.id}&proposal_id=${approvedProposal.id}`}
          >
            Formalizar contratacao
          </CButton>
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
            canApprove={!isCarrierPortal && hasPermission('freight_quotations.approve')}
          />
          {isCarrierPortal && hasPermission('freight_quotations.respond') && carrierProposal ? (
            <CCard className="mt-4 shadow-sm border-0">
              <CCardHeader>Responder proposta</CCardHeader>
              <CCardBody>
                <CForm onSubmit={handleRespondProposal}>
                  <CRow className="g-3">
                    <CCol md={4}>
                      <CFormLabel>Status da resposta</CFormLabel>
                      <CFormSelect
                        value={responseForm.status_resposta}
                        onChange={(event) =>
                          setResponseForm((current) => ({ ...current, status_resposta: event.target.value }))
                        }
                      >
                        <option value="respondida">Enviar proposta</option>
                        <option value="recusada">Recusar participacao</option>
                      </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel>Valor do frete</CFormLabel>
                      <CFormInput
                        value={responseForm.valor_frete}
                        onChange={(event) =>
                          setResponseForm((current) => ({ ...current, valor_frete: event.target.value }))
                        }
                        disabled={responseForm.status_resposta !== 'respondida'}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel>Prazo de entrega</CFormLabel>
                      <CFormInput
                        value={responseForm.prazo_entrega_dias}
                        onChange={(event) =>
                          setResponseForm((current) => ({ ...current, prazo_entrega_dias: event.target.value }))
                        }
                        disabled={responseForm.status_resposta !== 'respondida'}
                      />
                    </CCol>
                    <CCol md={12}>
                      <CFormLabel>Observacoes comerciais</CFormLabel>
                      <CFormTextarea
                        rows={3}
                        value={responseForm.observacoes}
                        onChange={(event) =>
                          setResponseForm((current) => ({ ...current, observacoes: event.target.value }))
                        }
                      />
                    </CCol>
                    <CCol xs={12} className="d-flex justify-content-end">
                      <CButton color="primary" type="submit" disabled={isSubmittingResponse}>
                        {isSubmittingResponse ? 'Enviando...' : 'Enviar resposta'}
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          ) : null}
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
