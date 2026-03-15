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
import { tripDocumentTypes } from '../utils/tripDocumentValidation'

const TripDocumentUploadForm = ({ values, errors, options, isSubmitting, onChange, onFileChange, onSubmit }) => {
  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader>Upload de documento</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={4}>
              <CFormLabel>OT</CFormLabel>
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
            <CCol md={4}>
              <CFormLabel>Tipo de documento</CFormLabel>
              <CFormSelect name="tipo_documento" value={values.tipo_documento} onChange={onChange} invalid={Boolean(errors.tipo_documento)}>
                <option value="">Selecione</option>
                {tripDocumentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </CFormSelect>
              {errors.tipo_documento ? <div className="invalid-feedback d-block">{errors.tipo_documento}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Numero do documento</CFormLabel>
              <CFormInput name="numero_documento" value={values.numero_documento} onChange={onChange} />
            </CCol>
            <CCol md={12}>
              <CFormLabel>Arquivo</CFormLabel>
              <CFormInput type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={onFileChange} invalid={Boolean(errors.arquivo)} />
              {errors.arquivo ? <div className="invalid-feedback d-block">{errors.arquivo}</div> : null}
            </CCol>
            <CCol md={12}>
              <CFormLabel>Observacoes</CFormLabel>
              <CFormTextarea name="observacoes" rows={4} value={values.observacoes} onChange={onChange} />
            </CCol>
          </CRow>
          <div className="mt-4 d-flex justify-content-end">
            <CButton color="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar documento'}
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default TripDocumentUploadForm
