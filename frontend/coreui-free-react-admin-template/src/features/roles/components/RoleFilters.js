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

const RoleFilters = ({ filters, onChange, onSearch, onReset }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardBody>
      <CRow className="g-3 align-items-end">
        <CCol md={5}>
          <CFormLabel>Busca</CFormLabel>
          <CFormInput name="search" value={filters.search} onChange={onChange} placeholder="Nome ou descricao" />
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
          <CFormLabel>Escopo</CFormLabel>
          <CFormSelect name="scope" value={filters.scope} onChange={onChange}>
            <option value="">Todos</option>
            <option value="global">Global</option>
            <option value="company">Empresa</option>
            <option value="carrier">Transportadora</option>
            <option value="driver">Motorista</option>
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

export default RoleFilters
