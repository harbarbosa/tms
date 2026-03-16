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

const CompanyFilters = ({ filters, onChange, onSearch, onReset }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardBody>
      <CRow className="g-3 align-items-end">
        <CCol md={4}>
          <CFormLabel>Busca</CFormLabel>
          <CFormInput
            name="search"
            value={filters.search}
            onChange={onChange}
            placeholder="Razao social, fantasia, CNPJ ou e-mail"
          />
        </CCol>
        <CCol md={2}>
          <CFormLabel>Status</CFormLabel>
          <CFormSelect name="status" value={filters.status} onChange={onChange}>
            <option value="">Todos</option>
            <option value="active">Ativa</option>
            <option value="inactive">Inativa</option>
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <CFormLabel>Tipo</CFormLabel>
          <CFormSelect name="tipo_empresa" value={filters.tipo_empresa} onChange={onChange}>
            <option value="">Todos</option>
            <option value="embarcador">Embarcador</option>
            <option value="transportadora">Transportadora</option>
            <option value="operador_logistico">Operador logistico</option>
            <option value="hibrida">Hibrida</option>
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <CFormLabel>Cidade</CFormLabel>
          <CFormInput name="cidade" value={filters.cidade} onChange={onChange} placeholder="Cidade" />
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

export default CompanyFilters
