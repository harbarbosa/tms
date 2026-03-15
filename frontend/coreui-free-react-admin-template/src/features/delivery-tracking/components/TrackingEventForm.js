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
import { trackingStatuses } from '../utils/deliveryTrackingValidation'

const TrackingEventForm = ({ values, errors, isSubmitting, onChange, onSubmit }) => {
  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader>Novo evento de rastreamento</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={4}>
              <CFormLabel>Status</CFormLabel>
              <CFormSelect name="status" value={values.status} onChange={onChange} invalid={Boolean(errors.status)}>
                {trackingStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </CFormSelect>
              {errors.status ? <div className="invalid-feedback d-block">{errors.status}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Data e hora</CFormLabel>
              <CFormInput type="datetime-local" name="event_at" value={values.event_at} onChange={onChange} invalid={Boolean(errors.event_at)} />
              {errors.event_at ? <div className="invalid-feedback d-block">{errors.event_at}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Referencia de anexo futuro</CFormLabel>
              <CFormInput name="attachment_path" value={values.attachment_path} onChange={onChange} placeholder="Ex.: uploads/foto.jpg" />
            </CCol>
            <CCol md={12}>
              <CFormLabel>Observacoes</CFormLabel>
              <CFormTextarea name="observacoes" rows={3} value={values.observacoes} onChange={onChange} />
            </CCol>
          </CRow>
          <div className="mt-4 d-flex justify-content-end">
            <CButton color="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Registrar evento'}
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default TrackingEventForm
