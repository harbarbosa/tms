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
import { incidentStatuses } from '../utils/incidentValidation'

const IncidentForm = ({ values, errors, options, isSubmitting, onChange, onSubmit, submitLabel }) => {
  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader>Dados da ocorrencia</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={4}>
              <CFormLabel>OT</CFormLabel>
              <CFormSelect
                name="transport_document_id"
                value={values.transport_document_id}
                onChange={onChange}
                invalid={Boolean(errors.transport_document_id)}
              >
                <option value="">Selecione</option>
                {(options.transport_documents || []).map((document) => (
                  <option key={document.id} value={document.id}>
                    {document.numero_ot}
                  </option>
                ))}
              </CFormSelect>
              {errors.transport_document_id ? <div className="invalid-feedback d-block">{errors.transport_document_id}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Tipo</CFormLabel>
              <CFormSelect name="tipo_ocorrencia" value={values.tipo_ocorrencia} onChange={onChange} invalid={Boolean(errors.tipo_ocorrencia)}>
                <option value="">Selecione</option>
                {(options.typeOptions || []).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </CFormSelect>
              {errors.tipo_ocorrencia ? <div className="invalid-feedback d-block">{errors.tipo_ocorrencia}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Status</CFormLabel>
              <CFormSelect name="status" value={values.status} onChange={onChange} invalid={Boolean(errors.status)}>
                {(options.statusOptions || incidentStatuses).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </CFormSelect>
              {errors.status ? <div className="invalid-feedback d-block">{errors.status}</div> : null}
            </CCol>
            <CCol md={2}>
              <CFormLabel>Data e hora</CFormLabel>
              <CFormInput type="datetime-local" name="occurred_at" value={values.occurred_at} onChange={onChange} invalid={Boolean(errors.occurred_at)} />
              {errors.occurred_at ? <div className="invalid-feedback d-block">{errors.occurred_at}</div> : null}
            </CCol>
            <CCol md={12}>
              <CFormLabel>Observacoes</CFormLabel>
              <CFormTextarea name="observacoes" rows={4} value={values.observacoes} onChange={onChange} />
            </CCol>
            <CCol md={12}>
              <CFormLabel>Referencia de anexo futuro</CFormLabel>
              <CFormInput name="attachment_path" value={values.attachment_path} onChange={onChange} placeholder="Ex.: uploads/ocorrencia/foto1.jpg" />
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

export default IncidentForm
