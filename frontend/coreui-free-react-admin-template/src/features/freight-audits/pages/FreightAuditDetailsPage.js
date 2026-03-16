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
import freightAuditService from '../services/freightAuditService'

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const FreightAuditDetailsPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [audit, setAudit] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAudit = async () => {
      try {
        const data = await freightAuditService.findById(id)
        setAudit(data)
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    loadAudit()
  }, [dispatch, id])

  if (isLoading) {
    return <CAlert color="info">Carregando detalhes da auditoria...</CAlert>
  }

  if (!audit) {
    return <CAlert color="warning">Auditoria nao encontrada.</CAlert>
  }

  const isDivergence = Number(audit.diferenca_valor || 0) !== 0 || audit.status_auditoria === 'divergente'

  return (
    <>
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <CButton color="secondary" variant="outline" as={Link} to="/control/freight-audits">
          Voltar
        </CButton>
        <CButton color="info" variant="outline" as={Link} to={`/control/freight-audits/${audit.id}/edit`}>
          Editar auditoria
        </CButton>
        <CButton color="dark" variant="outline" as={Link} to={`/operations/transport-documents/${audit.ordem_transporte_id}`}>
          Ver OT
        </CButton>
        {audit.summary?.financial_entry?.id ? (
          <CButton color="primary" variant="outline" as={Link} to={`/financial/${audit.summary.financial_entry.id}`}>
            Ver financeiro
          </CButton>
        ) : (
          <CButton color="primary" variant="outline" as={Link} to={`/financial/new?audit_id=${audit.id}`}>
            Gerar financeiro
          </CButton>
        )}
      </div>
      {isDivergence ? (
        <CAlert color="danger">
          Divergencia identificada na auditoria desta OT. Revise os valores antes de seguir para o financeiro.
        </CAlert>
      ) : (
        <CAlert color="success">Auditoria sem divergencia financeira identificada.</CAlert>
      )}
      <CRow className="g-4">
        <CCol lg={8}>
          <CCard className={`mb-4 shadow-sm border-0 ${isDivergence ? 'border-start border-danger border-4' : ''}`}>
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>{audit.numero_ot}</span>
              <CrudStatusBadge status={audit.status_auditoria} />
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={4}>
                  <strong>Transportadora</strong>
                  <div>{audit.transporter_name}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Auditado por</strong>
                  <div>{audit.auditado_por || '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Data auditoria</strong>
                  <div>{new Date(audit.data_auditoria).toLocaleString('pt-BR')}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Valor contratado</strong>
                  <div>{formatCurrency(audit.valor_contratado)}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Valor CTe</strong>
                  <div>{audit.valor_cte ? formatCurrency(audit.valor_cte) : '-'}</div>
                </CCol>
                <CCol md={4}>
                  <strong>Valor cobrado</strong>
                  <div>{formatCurrency(audit.valor_cobrado)}</div>
                </CCol>
                <CCol md={12}>
                  <strong>Diferenca</strong>
                  <div className={`fs-4 fw-semibold ${isDivergence ? 'text-danger' : 'text-success'}`}>
                    {formatCurrency(audit.diferenca_valor)}
                  </div>
                </CCol>
                <CCol md={12}>
                  <strong>Observacoes</strong>
                  <div>{audit.observacoes || '-'}</div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={4}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader>Base para financeiro</CCardHeader>
            <CCardBody>
              <CListGroup flush>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Documentos CTe</span>
                  <span>{audit.summary?.cte_count || 0}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Comprovante de entrega</span>
                  <span>{audit.summary?.has_proof_of_delivery ? 'Disponivel' : 'Pendente'}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Status da OT</span>
                  <span>{audit.ordem_status || '-'}</span>
                </CListGroupItem>
                <CListGroupItem className="px-0 d-flex justify-content-between">
                  <span>Financeiro</span>
                  <span>{audit.summary?.financial_entry?.id ? 'Gerado' : 'Pendente'}</span>
                </CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default FreightAuditDetailsPage
