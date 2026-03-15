import React, { useMemo } from 'react'
import {
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
  CRow,
} from '@coreui/react'
import { freightAuditStatuses } from '../utils/freightAuditValidation'

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const FreightAuditForm = ({ values, errors, options, isSubmitting, onChange, onSubmit, submitLabel }) => {
  const selectedTransportDocument = useMemo(
    () => (options.transport_documents || []).find((item) => String(item.id) === String(values.ordem_transporte_id)),
    [options.transport_documents, values.ordem_transporte_id],
  )

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader>Dados da auditoria</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel>Ordem de transporte</CFormLabel>
              <CFormSelect
                name="ordem_transporte_id"
                value={values.ordem_transporte_id}
                onChange={onChange}
                invalid={Boolean(errors.ordem_transporte_id)}
              >
                <option value="">Selecione</option>
                {(options.transport_documents || []).map((document) => (
                  <option key={document.id} value={document.id}>
                    {document.numero_ot}
                  </option>
                ))}
              </CFormSelect>
              {errors.ordem_transporte_id ? <div className="invalid-feedback d-block">{errors.ordem_transporte_id}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Data auditoria</CFormLabel>
              <CFormInput type="datetime-local" name="data_auditoria" value={values.data_auditoria} onChange={onChange} invalid={Boolean(errors.data_auditoria)} />
              {errors.data_auditoria ? <div className="invalid-feedback d-block">{errors.data_auditoria}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Status</CFormLabel>
              <CFormSelect name="status_auditoria" value={values.status_auditoria} onChange={onChange} invalid={Boolean(errors.status_auditoria)}>
                {freightAuditStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </CFormSelect>
              {errors.status_auditoria ? <div className="invalid-feedback d-block">{errors.status_auditoria}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Valor contratado</CFormLabel>
              <CFormInput type="number" step="0.01" name="valor_contratado" value={values.valor_contratado} onChange={onChange} invalid={Boolean(errors.valor_contratado)} />
              {errors.valor_contratado ? <div className="invalid-feedback d-block">{errors.valor_contratado}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Valor CTe</CFormLabel>
              <CFormInput type="number" step="0.01" name="valor_cte" value={values.valor_cte} onChange={onChange} invalid={Boolean(errors.valor_cte)} />
              {errors.valor_cte ? <div className="invalid-feedback d-block">{errors.valor_cte}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Valor cobrado</CFormLabel>
              <CFormInput type="number" step="0.01" name="valor_cobrado" value={values.valor_cobrado} onChange={onChange} invalid={Boolean(errors.valor_cobrado)} />
              {errors.valor_cobrado ? <div className="invalid-feedback d-block">{errors.valor_cobrado}</div> : null}
            </CCol>
            <CCol md={12}>
              <div className="p-3 rounded border bg-body-tertiary">
                <div className="small text-body-secondary">Diferenca projetada</div>
                <div className={`fs-5 fw-semibold ${Number(values.diferenca_valor || 0) !== 0 ? 'text-danger' : 'text-success'}`}>
                  {formatCurrency(values.diferenca_valor)}
                </div>
                {selectedTransportDocument?.valor_frete_contratado ? (
                  <div className="small text-body-secondary mt-1">
                    Valor contratado na OT: {formatCurrency(selectedTransportDocument.valor_frete_contratado)}
                  </div>
                ) : null}
              </div>
            </CCol>
            <CCol md={12}>
              <CFormLabel>Observacoes</CFormLabel>
              <CFormTextarea name="observacoes" rows={4} value={values.observacoes} onChange={onChange} />
            </CCol>
          </CRow>
          <div className="mt-4 d-flex justify-content-end">
            <CButton color="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : submitLabel}
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default FreightAuditForm
