import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
} from '@coreui/react'

const UserForm = ({
  values,
  errors,
  options,
  isSubmitting,
  isEdit,
  onChange,
  onToggleCompany,
  onToggleRole,
  onSubmit,
  submitLabel,
}) => (
  <CCard className="shadow-sm border-0">
    <CCardHeader>Dados do usuario</CCardHeader>
    <CCardBody>
      <CForm onSubmit={onSubmit}>
        <CRow className="g-3">
          <CCol md={6}>
            <CFormLabel>Nome</CFormLabel>
            <CFormInput name="name" value={values.name} onChange={onChange} invalid={Boolean(errors.name)} />
            {errors.name ? <div className="invalid-feedback d-block">{errors.name}</div> : null}
          </CCol>
          <CCol md={6}>
            <CFormLabel>E-mail</CFormLabel>
            <CFormInput name="email" value={values.email} onChange={onChange} invalid={Boolean(errors.email)} />
            {errors.email ? <div className="invalid-feedback d-block">{errors.email}</div> : null}
          </CCol>
          <CCol md={4}>
            <CFormLabel>Telefone</CFormLabel>
            <CFormInput name="telefone" value={values.telefone} onChange={onChange} />
          </CCol>
          <CCol md={4}>
            <CFormLabel>{isEdit ? 'Nova senha' : 'Senha inicial'}</CFormLabel>
            <CFormInput type="password" name="password" value={values.password} onChange={onChange} invalid={Boolean(errors.password)} />
            {errors.password ? <div className="invalid-feedback d-block">{errors.password}</div> : null}
          </CCol>
          <CCol md={4}>
            <CFormLabel>Status</CFormLabel>
            <CFormSelect name="status" value={values.status} onChange={onChange} invalid={Boolean(errors.status)}>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </CFormSelect>
            {errors.status ? <div className="invalid-feedback d-block">{errors.status}</div> : null}
          </CCol>
          <CCol md={6}>
            <CFormLabel>Empresa principal</CFormLabel>
            <CFormSelect name="primary_company_id" value={values.primary_company_id} onChange={onChange} invalid={Boolean(errors.primary_company_id)}>
              <option value="">Selecione</option>
              {options.companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </CFormSelect>
            {errors.primary_company_id ? <div className="invalid-feedback d-block">{errors.primary_company_id}</div> : null}
          </CCol>
          <CCol md={6}>
            <CFormLabel>Perfil principal</CFormLabel>
            <CFormSelect name="primary_role_id" value={values.primary_role_id} onChange={onChange} invalid={Boolean(errors.primary_role_id)}>
              <option value="">Selecione</option>
              {options.roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </CFormSelect>
            {errors.primary_role_id ? <div className="invalid-feedback d-block">{errors.primary_role_id}</div> : null}
          </CCol>
          <CCol md={6}>
            <CFormLabel>Empresas vinculadas</CFormLabel>
            <CCard className="border">
              <CCardBody className="py-2">
                {options.companies.map((company) => (
                  <CFormCheck
                    key={company.id}
                    id={`company-${company.id}`}
                    className="mb-2"
                    label={company.name}
                    checked={values.company_ids.includes(String(company.id))}
                    onChange={() => onToggleCompany(String(company.id))}
                  />
                ))}
              </CCardBody>
            </CCard>
            {errors.company_ids ? <div className="invalid-feedback d-block">{errors.company_ids}</div> : null}
          </CCol>
          <CCol md={6}>
            <CFormLabel>Perfis vinculados</CFormLabel>
            <CCard className="border">
              <CCardBody className="py-2">
                {options.roles.map((role) => (
                  <CFormCheck
                    key={role.id}
                    id={`role-${role.id}`}
                    className="mb-2"
                    label={role.name}
                    checked={values.role_ids.includes(String(role.id))}
                    onChange={() => onToggleRole(String(role.id))}
                  />
                ))}
              </CCardBody>
            </CCard>
            {errors.role_ids ? <div className="invalid-feedback d-block">{errors.role_ids}</div> : null}
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

export default UserForm
