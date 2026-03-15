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

const DriverForm = ({
  values,
  errors,
  carriers,
  isSubmitting,
  onChange,
  onSubmit,
  submitLabel,
}) => {
  return (
    <CCard>
      <CCardHeader>Dados do motorista</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel>Transportadora</CFormLabel>
              <CFormSelect
                name="transporter_id"
                value={values.transporter_id}
                onChange={onChange}
                invalid={Boolean(errors.transporter_id)}
              >
                <option value="">Selecione</option>
                {carriers.map((carrier) => (
                  <option key={carrier.id} value={carrier.id}>
                    {carrier.nome_fantasia || carrier.razao_social}
                  </option>
                ))}
              </CFormSelect>
              {errors.transporter_id ? <div className="invalid-feedback d-block">{errors.transporter_id}</div> : null}
            </CCol>
            <CCol md={6}>
              <CFormLabel>Nome</CFormLabel>
              <CFormInput name="nome" value={values.nome} onChange={onChange} invalid={Boolean(errors.nome)} />
              {errors.nome ? <div className="invalid-feedback d-block">{errors.nome}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>CPF</CFormLabel>
              <CFormInput name="cpf" value={values.cpf} onChange={onChange} invalid={Boolean(errors.cpf)} />
              {errors.cpf ? <div className="invalid-feedback d-block">{errors.cpf}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>CNH</CFormLabel>
              <CFormInput name="cnh" value={values.cnh} onChange={onChange} invalid={Boolean(errors.cnh)} />
              {errors.cnh ? <div className="invalid-feedback d-block">{errors.cnh}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Categoria CNH</CFormLabel>
              <CFormInput
                name="categoria_cnh"
                value={values.categoria_cnh}
                onChange={onChange}
                invalid={Boolean(errors.categoria_cnh)}
              />
              {errors.categoria_cnh ? <div className="invalid-feedback d-block">{errors.categoria_cnh}</div> : null}
            </CCol>
            <CCol md={3}>
              <CFormLabel>Validade CNH</CFormLabel>
              <CFormInput
                type="date"
                name="validade_cnh"
                value={values.validade_cnh}
                onChange={onChange}
                invalid={Boolean(errors.validade_cnh)}
              />
              {errors.validade_cnh ? <div className="invalid-feedback d-block">{errors.validade_cnh}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Telefone</CFormLabel>
              <CFormInput name="telefone" value={values.telefone} onChange={onChange} />
            </CCol>
            <CCol md={4}>
              <CFormLabel>E-mail</CFormLabel>
              <CFormInput name="email" value={values.email} onChange={onChange} invalid={Boolean(errors.email)} />
              {errors.email ? <div className="invalid-feedback d-block">{errors.email}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Status</CFormLabel>
              <CFormSelect name="status" value={values.status} onChange={onChange} invalid={Boolean(errors.status)}>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </CFormSelect>
              {errors.status ? <div className="invalid-feedback d-block">{errors.status}</div> : null}
            </CCol>
            <CCol md={12}>
              <CFormLabel>Observacoes</CFormLabel>
              <CFormTextarea name="observacoes" rows={4} value={values.observacoes} onChange={onChange} />
            </CCol>
          </CRow>
          <div className="mt-4 d-flex gap-2 justify-content-end">
            <CButton color="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : submitLabel}
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default DriverForm
