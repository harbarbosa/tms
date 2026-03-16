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

const FreightHiringForm = ({ values, errors, options, isSubmitting, onChange, onSubmit, submitLabel }) => {
  const selectedQuotation = (options.quotations || []).find((item) => String(item.id) === String(values.freight_quotation_id))
  const approvedProposals = selectedQuotation?.approved_proposals || []

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader>Dados da contratacao</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel>Cotacao aprovada</CFormLabel>
              <CFormSelect
                name="freight_quotation_id"
                value={values.freight_quotation_id}
                onChange={onChange}
                invalid={Boolean(errors.freight_quotation_id)}
              >
                <option value="">Selecione</option>
                {(options.quotations || []).map((quotation) => (
                  <option key={quotation.id} value={quotation.id}>
                    {quotation.reference_summary?.label || `Cotacao #${quotation.id}`}
                  </option>
                ))}
              </CFormSelect>
              {errors.freight_quotation_id ? <div className="invalid-feedback d-block">{errors.freight_quotation_id}</div> : null}
            </CCol>
            <CCol md={6}>
              <CFormLabel>Proposta aprovada</CFormLabel>
              <CFormSelect
                name="freight_quotation_proposal_id"
                value={values.freight_quotation_proposal_id}
                onChange={onChange}
                invalid={Boolean(errors.freight_quotation_proposal_id)}
              >
                <option value="">Selecione</option>
                {approvedProposals.map((proposal) => (
                  <option key={proposal.id} value={proposal.id}>
                    {proposal.transporter_name} - {proposal.valor_frete || 0}
                  </option>
                ))}
              </CFormSelect>
              {errors.freight_quotation_proposal_id ? <div className="invalid-feedback d-block">{errors.freight_quotation_proposal_id}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Tipo referencia</CFormLabel>
              <CFormSelect name="tipo_referencia" value={values.tipo_referencia} onChange={onChange} invalid={Boolean(errors.tipo_referencia)}>
                <option value="pedido">Pedido</option>
                <option value="carga">Carga</option>
              </CFormSelect>
              {errors.tipo_referencia ? <div className="invalid-feedback d-block">{errors.tipo_referencia}</div> : null}
            </CCol>
            <CCol md={5}>
              <CFormLabel>Referencia</CFormLabel>
              <CFormInput name="reference_label" value={values.reference_label || ''} onChange={onChange} disabled />
            </CCol>
            <CCol md={4}>
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
              <CFormLabel>Valor contratado</CFormLabel>
              <CFormInput type="number" step="0.01" name="valor_contratado" value={values.valor_contratado} onChange={onChange} />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Prazo entrega dias</CFormLabel>
              <CFormInput type="number" min="0" name="prazo_entrega_dias" value={values.prazo_entrega_dias} onChange={onChange} />
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
            <CCol md={6}>
              <CFormLabel>Contratado por</CFormLabel>
              <CFormInput name="contratado_por" value={values.contratado_por} onChange={onChange} />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Data contratacao</CFormLabel>
              <CFormInput type="datetime-local" name="data_contratacao" value={values.data_contratacao} onChange={onChange} invalid={Boolean(errors.data_contratacao)} />
              {errors.data_contratacao ? <div className="invalid-feedback d-block">{errors.data_contratacao}</div> : null}
            </CCol>
            <CCol md={12}>
              <CFormLabel>Condicoes comerciais</CFormLabel>
              <CFormTextarea name="condicoes_comerciais" rows={3} value={values.condicoes_comerciais} onChange={onChange} />
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
}

export default FreightHiringForm
