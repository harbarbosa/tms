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
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CListGroup,
  CListGroupItem,
  CRow,
} from '@coreui/react'
import CrudStatusBadge from '../../../components/crud/CrudStatusBadge'
import FinancialTimeline from '../components/FinancialTimeline'
import financialService from '../services/financialService'

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const FinancialDetailsPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [entry, setEntry] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState('')
  const [actionForm, setActionForm] = useState({
    decision_reason: '',
    motivo_bloqueio: '',
    valor_pago: '',
    data_pagamento: '',
    forma_pagamento: '',
    observacoes: '',
  })

  const loadEntry = async () => {
    try {
      const data = await financialService.findById(id)
      setEntry(data)
      setActionForm((current) => ({
        ...current,
        valor_pago: data.valor_aprovado ?? data.valor_previsto ?? '',
        forma_pagamento: data.forma_pagamento || '',
      }))
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEntry()
  }, [id])

  const runAction = async (action) => {
    try {
      if (action === 'approve') {
        await financialService.approve(id, { motivo: actionForm.decision_reason })
        setFeedback('Lancamento aprovado com sucesso.')
      }

      if (action === 'reject') {
        await financialService.reject(id, { motivo: actionForm.decision_reason })
        setFeedback('Lancamento reprovado com sucesso.')
      }

      if (action === 'liberate') {
        await financialService.liberate(id)
        setFeedback('Lancamento liberado com sucesso.')
      }

      if (action === 'block') {
        await financialService.block(id, { motivo_bloqueio: actionForm.motivo_bloqueio })
        setFeedback('Lancamento bloqueado com sucesso.')
      }

      if (action === 'paid') {
        await financialService.markPaid(id, {
          valor_pago: actionForm.valor_pago,
          data_pagamento: actionForm.data_pagamento,
          forma_pagamento: actionForm.forma_pagamento,
        })
        setFeedback('Pagamento registrado com sucesso.')
      }

      if (action === 'cancel') {
        await financialService.cancel(id, { observacoes: actionForm.observacoes })
        setFeedback('Lancamento cancelado com sucesso.')
      }

      await loadEntry()
    } catch (error) {
      dispatch({ type: 'app/setError', payload: error.message })
    }
  }

  if (isLoading) {
    return <CAlert color="info">Carregando detalhe financeiro...</CAlert>
  }

  if (!entry) {
    return <CAlert color="warning">Lancamento financeiro nao encontrado.</CAlert>
  }

  return (
    <>
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <CButton color="secondary" variant="outline" as={Link} to="/financial">
          Voltar
        </CButton>
        <CButton color="info" variant="outline" as={Link} to={`/financial/${entry.id}/edit`}>
          Editar
        </CButton>
        <CButton color="dark" variant="outline" as={Link} to={`/control/freight-audits/${entry.freight_audit_id}`}>
          Ver auditoria
        </CButton>
        <CButton color="secondary" variant="outline" as={Link} to={`/operations/transport-documents/${entry.transport_document_id}`}>
          Ver OT
        </CButton>
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      {entry.operational_flags?.blocked_by_divergence ? (
        <CAlert color="danger">Este lancamento possui divergencia de auditoria e impacta a liberacao financeira.</CAlert>
      ) : null}
      <CRow className="g-4">
        <CCol lg={8}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>{entry.numero_ot}</span>
              <CrudStatusBadge status={entry.status} />
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={4}>
                  <strong>Transportadora</strong>
                  <div>{entry.transporter_name}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Empresa</strong>
                  <div>{entry.nome_fantasia || entry.razao_social || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Status auditoria</strong>
                  <div>
                    <CrudStatusBadge status={entry.status_auditoria} />
                  </div>
                </CCol>
                <CCol md={4}>
                  <strong>Valor previsto</strong>
                  <div>{formatCurrency(entry.valor_previsto)}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Valor aprovado</strong>
                  <div>{entry.valor_aprovado ? formatCurrency(entry.valor_aprovado) : '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Valor pago</strong>
                  <div>{entry.valor_pago ? formatCurrency(entry.valor_pago) : '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Prev. pagamento</strong>
                  <div>{entry.data_prevista_pagamento || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Data pagamento</strong>
                  <div>{entry.data_pagamento || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Forma pagamento</strong>
                  <div>{entry.forma_pagamento || '-'}</div>
                </CCol>
                <CCol md={12}>
                  <strong>Motivo bloqueio</strong>
                  <div>{entry.motivo_bloqueio || '-'}</div>
                </CCol>
                <CCol md={12}>
                  <strong>Observacoes</strong>
                  <div>{entry.observacoes || '-'}</div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
          <FinancialTimeline history={entry.history || []} />
        </CCol>
        <CCol lg={4}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader>Aprovacao e conciliacao</CCardHeader>
            <CCardBody>
              <div className="d-grid gap-3">
                <div>
                  <CFormLabel>Motivo da decisao</CFormLabel>
                  <CFormTextarea
                    rows={2}
                    value={actionForm.decision_reason}
                    onChange={(event) => setActionForm((current) => ({ ...current, decision_reason: event.target.value }))}
                  />
                  <div className="d-grid gap-2 mt-2">
                    <CButton color="success" onClick={() => runAction('approve')} disabled={!entry.can_approve}>
                      Aprovar
                    </CButton>
                    <CButton color="danger" variant="outline" onClick={() => runAction('reject')} disabled={!entry.can_reject}>
                      Reprovar
                    </CButton>
                  </div>
                </div>
                <CButton color="primary" onClick={() => runAction('liberate')} disabled={!entry.can_liberate}>
                  Liberar
                </CButton>
                <div>
                  <CFormLabel>Motivo bloqueio</CFormLabel>
                  <CFormSelect
                    value={actionForm.motivo_bloqueio}
                    onChange={(event) => setActionForm((current) => ({ ...current, motivo_bloqueio: event.target.value }))}
                  >
                    <option value="">Selecione</option>
                    {(entry.blockReasonOptions || []).map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </CFormSelect>
                  <CButton color="warning" className="mt-2 w-100" onClick={() => runAction('block')} disabled={!entry.can_block}>
                    Bloquear
                  </CButton>
                </div>
                <div>
                  <CFormLabel>Valor pago</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>R$</CInputGroupText>
                    <CFormInput
                      type="number"
                      step="0.01"
                      value={actionForm.valor_pago}
                      onChange={(event) => setActionForm((current) => ({ ...current, valor_pago: event.target.value }))}
                    />
                  </CInputGroup>
                  <CFormLabel className="mt-2">Data pagamento</CFormLabel>
                  <CFormInput
                    type="date"
                    value={actionForm.data_pagamento}
                    onChange={(event) => setActionForm((current) => ({ ...current, data_pagamento: event.target.value }))}
                  />
                  <CFormLabel className="mt-2">Forma pagamento</CFormLabel>
                  <CFormSelect
                    value={actionForm.forma_pagamento}
                    onChange={(event) => setActionForm((current) => ({ ...current, forma_pagamento: event.target.value }))}
                  >
                    <option value="">Selecione</option>
                    {(entry.paymentMethods || []).map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </CFormSelect>
                  <CButton color="success" className="mt-2 w-100" onClick={() => runAction('paid')} disabled={!entry.can_mark_paid}>
                    Marcar pago
                  </CButton>
                </div>
                <div>
                  <CFormLabel>Observacoes cancelamento</CFormLabel>
                  <CFormTextarea
                    rows={2}
                    value={actionForm.observacoes}
                    onChange={(event) => setActionForm((current) => ({ ...current, observacoes: event.target.value }))}
                  />
                  <CButton color="danger" className="mt-2 w-100" onClick={() => runAction('cancel')} disabled={!entry.can_cancel}>
                    Cancelar
                  </CButton>
                </div>
              </div>
            </CCardBody>
          </CCard>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader>Rastreabilidade</CCardHeader>
            <CCardBody>
              <CListGroup flush>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Criado por</span>
                  <span>{entry.criado_por || '-'}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Atualizado por</span>
                  <span>{entry.atualizado_por || '-'}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Diferenca auditoria</span>
                  <span>{formatCurrency(entry.diferenca_valor)}</span>
                </CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default FinancialDetailsPage
