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
  CRow,
} from '@coreui/react'

const CarrierForm = ({ values, errors, isSubmitting, onChange, onSubmit, submitLabel }) => {
  return (
    <CCard>
      <CCardHeader>Dados da transportadora</CCardHeader>
      <CCardBody>
        <CForm onSubmit={onSubmit}>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel>Razao social</CFormLabel>
              <CFormInput name="razao_social" value={values.razao_social} onChange={onChange} invalid={Boolean(errors.razao_social)} />
              {errors.razao_social ? <div className="invalid-feedback d-block">{errors.razao_social}</div> : null}
            </CCol>
            <CCol md={6}>
              <CFormLabel>Nome fantasia</CFormLabel>
              <CFormInput name="nome_fantasia" value={values.nome_fantasia} onChange={onChange} />
            </CCol>
            <CCol md={4}>
              <CFormLabel>CNPJ</CFormLabel>
              <CFormInput name="cnpj" value={values.cnpj} onChange={onChange} invalid={Boolean(errors.cnpj)} />
              {errors.cnpj ? <div className="invalid-feedback d-block">{errors.cnpj}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>ANTT</CFormLabel>
              <CFormInput name="antt" value={values.antt} onChange={onChange} invalid={Boolean(errors.antt)} />
              {errors.antt ? <div className="invalid-feedback d-block">{errors.antt}</div> : null}
            </CCol>
            <CCol md={4}>
              <CFormLabel>Status</CFormLabel>
              <CFormSelect name="status" value={values.status} onChange={onChange} invalid={Boolean(errors.status)}>
                <option value="active">Ativa</option>
                <option value="inactive">Inativa</option>
              </CFormSelect>
              {errors.status ? <div className="invalid-feedback d-block">{errors.status}</div> : null}
            </CCol>
            <CCol md={6}>
              <CFormLabel>E-mail</CFormLabel>
              <CFormInput name="email" value={values.email} onChange={onChange} invalid={Boolean(errors.email)} />
              {errors.email ? <div className="invalid-feedback d-block">{errors.email}</div> : null}
            </CCol>
            <CCol md={6}>
              <CFormLabel>Telefone</CFormLabel>
              <CFormInput name="telefone" value={values.telefone} onChange={onChange} />
            </CCol>
            <CCol md={3}>
              <CFormLabel>CEP</CFormLabel>
              <CFormInput name="cep" value={values.cep} onChange={onChange} />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Endereco</CFormLabel>
              <CFormInput name="endereco" value={values.endereco} onChange={onChange} />
            </CCol>
            <CCol md={3}>
              <CFormLabel>Numero</CFormLabel>
              <CFormInput name="numero" value={values.numero} onChange={onChange} />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Complemento</CFormLabel>
              <CFormInput name="complemento" value={values.complemento} onChange={onChange} />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Bairro</CFormLabel>
              <CFormInput name="bairro" value={values.bairro} onChange={onChange} />
            </CCol>
            <CCol md={3}>
              <CFormLabel>Cidade</CFormLabel>
              <CFormInput name="cidade" value={values.cidade} onChange={onChange} />
            </CCol>
            <CCol md={1}>
              <CFormLabel>UF</CFormLabel>
              <CFormInput name="estado" value={values.estado} onChange={onChange} maxLength={2} />
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

export default CarrierForm
