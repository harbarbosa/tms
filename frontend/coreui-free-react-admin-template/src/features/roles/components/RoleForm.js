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

const RoleForm = ({ values, errors, isSubmitting, onChange, onSubmit, submitLabel }) => (
  <CCard className="shadow-sm border-0">
    <CCardHeader>Dados do perfil</CCardHeader>
    <CCardBody>
      <CForm onSubmit={onSubmit}>
        <CRow className="g-3">
          <CCol md={6}>
            <CFormLabel>Nome</CFormLabel>
            <CFormInput name="name" value={values.name} onChange={onChange} invalid={Boolean(errors.name)} />
            {errors.name ? <div className="invalid-feedback d-block">{errors.name}</div> : null}
          </CCol>
          <CCol md={3}>
            <CFormLabel>Escopo</CFormLabel>
            <CFormSelect name="scope" value={values.scope} onChange={onChange} invalid={Boolean(errors.scope)}>
              <option value="global">Global</option>
              <option value="company">Empresa</option>
              <option value="carrier">Transportadora</option>
              <option value="driver">Motorista</option>
            </CFormSelect>
            {errors.scope ? <div className="invalid-feedback d-block">{errors.scope}</div> : null}
          </CCol>
          <CCol md={3}>
            <CFormLabel>Status</CFormLabel>
            <CFormSelect name="status" value={values.status} onChange={onChange} invalid={Boolean(errors.status)}>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </CFormSelect>
            {errors.status ? <div className="invalid-feedback d-block">{errors.status}</div> : null}
          </CCol>
          <CCol md={12}>
            <CFormLabel>Descricao</CFormLabel>
            <CFormTextarea name="description" rows={4} value={values.description} onChange={onChange} />
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

export default RoleForm
