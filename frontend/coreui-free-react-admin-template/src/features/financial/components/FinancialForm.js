import React from 'react'
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

const FinancialForm = ({ values, errors, options, isSubmitting, onChange, onSubmit, submitLabel }) => (
  <CCard className="shadow-sm border-0">
    <CCardHeader>Dados financeiros</CCardHeader>
    <CCardBody>
      <CForm onSubmit={onSubmit}>
        <CRow className="g-3">
          <CCol md={6}>
            <CFormLabel>Auditoria</CFormLabel>
            <CFormSelect name="freight_audit_id" value={values.freight_audit_id} onChange={onChange} invalid={Boolean(errors.freight_audit_id)}>
              <option value="">Selecione</option>
              {(options.audits || []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.numero_ot} - {item.transporter_name}
                </option>
              ))}
            </CFormSelect>
            {errors.freight_audit_id ? <div className="invalid-feedback d-block">{errors.freight_audit_id}</div> : null}
          </CCol>
          <CCol md={6}>
            <CFormLabel>Transportadora</CFormLabel>
            <CFormSelect name="transporter_id" value={values.transporter_id} onChange={onChange} invalid={Boolean(errors.transporter_id)}>
              <option value="">Selecione</option>
              {(options.transporters || []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.razao_social}
                </option>
              ))}
            </CFormSelect>
            {errors.transporter_id ? <div className="invalid-feedback d-block">{errors.transporter_id}</div> : null}
          </CCol>
          <CCol md={4}>
            <CFormLabel>OT</CFormLabel>
            <CFormInput name="numero_ot" value={values.numero_ot || ''} onChange={onChange} disabled />
            {errors.transport_document_id ? <div className="invalid-feedback d-block">{errors.transport_document_id}</div> : null}
          </CCol>
          <CCol md={4}>
            <CFormLabel>Valor previsto</CFormLabel>
            <CFormInput type="number" step="0.01" name="valor_previsto" value={values.valor_previsto} onChange={onChange} invalid={Boolean(errors.valor_previsto)} />
            {errors.valor_previsto ? <div className="invalid-feedback d-block">{errors.valor_previsto}</div> : null}
          </CCol>
          <CCol md={4}>
            <CFormLabel>Valor aprovado</CFormLabel>
            <CFormInput type="number" step="0.01" name="valor_aprovado" value={values.valor_aprovado} onChange={onChange} />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Data prevista pagamento</CFormLabel>
            <CFormInput type="date" name="data_prevista_pagamento" value={values.data_prevista_pagamento} onChange={onChange} />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Forma pagamento</CFormLabel>
            <CFormSelect name="forma_pagamento" value={values.forma_pagamento} onChange={onChange}>
              <option value="">Selecione</option>
              {(options.paymentMethods || []).map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol md={4}>
            <CFormLabel>Status</CFormLabel>
            <CFormSelect name="status" value={values.status} onChange={onChange} invalid={Boolean(errors.status)}>
              {(options.statusOptions || []).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </CFormSelect>
            {errors.status ? <div className="invalid-feedback d-block">{errors.status}</div> : null}
          </CCol>
          <CCol md={12}>
            <CFormLabel>Motivo bloqueio</CFormLabel>
            <CFormSelect name="motivo_bloqueio" value={values.motivo_bloqueio} onChange={onChange}>
              <option value="">Selecione</option>
              {(options.blockReasonOptions || []).map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol md={12}>
            <CFormLabel>Observacoes</CFormLabel>
            <CFormTextarea name="observacoes" rows={3} value={values.observacoes} onChange={onChange} />
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

export default FinancialForm
