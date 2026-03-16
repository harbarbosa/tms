import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
} from '@coreui/react'

const UserFilters = ({ filters, options, onChange, onSearch, onReset }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardBody>
      <CRow className="g-3 align-items-end">
        <CCol md={3}>
          <CFormLabel>Busca</CFormLabel>
          <CFormInput name="search" value={filters.search} onChange={onChange} placeholder="Nome ou e-mail" />
        </CCol>
        <CCol md={2}>
          <CFormLabel>Status</CFormLabel>
          <CFormSelect name="status" value={filters.status} onChange={onChange}>
            <option value="">Todos</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </CFormSelect>
        </CCol>
        <CCol md={3}>
          <CFormLabel>Empresa</CFormLabel>
          <CFormSelect name="company_id" value={filters.company_id} onChange={onChange}>
            <option value="">Todas</option>
            {options.companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <CFormLabel>Perfil</CFormLabel>
          <CFormSelect name="role_id" value={filters.role_id} onChange={onChange}>
            <option value="">Todos</option>
            {options.roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <CFormLabel>Itens por pagina</CFormLabel>
          <CFormSelect name="perPage" value={filters.perPage} onChange={onChange}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </CFormSelect>
        </CCol>
        <CCol xs={12}>
          <div className="d-flex gap-2 justify-content-end">
            <CButton color="secondary" variant="outline" onClick={onReset}>
              Limpar
            </CButton>
            <CButton color="primary" onClick={onSearch}>
              Aplicar filtros
            </CButton>
          </div>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
)

export default UserFilters
