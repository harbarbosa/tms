import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
} from '@coreui/react'

const SettingsCatalogFilters = ({ filters, options, onChange, onSearch, onReset }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardBody>
      <CRow className="g-3 align-items-end">
        <CCol md={3}>
          <label className="form-label">Buscar</label>
          <CFormInput
            name="search"
            placeholder="Codigo, nome ou descricao"
            value={filters.search}
            onChange={onChange}
          />
        </CCol>
        <CCol md={3}>
          <label className="form-label">Catalogo</label>
          <CFormSelect name="catalog_type" value={filters.catalog_type} onChange={onChange}>
            <option value="">Todos</option>
            {(options.catalogTypes || []).map((item) => (
              <option key={item.key} value={item.key}>
                {item.section} - {item.label}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <label className="form-label">Escopo</label>
          <CFormSelect name="scope" value={filters.scope} onChange={onChange}>
            {(options.scopes || []).map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <label className="form-label">Status</label>
          <CFormSelect name="status" value={filters.status} onChange={onChange}>
            <option value="">Todos</option>
            {(options.statusOptions || []).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={1}>
          <label className="form-label">Por pagina</label>
          <CFormSelect name="perPage" value={filters.perPage} onChange={onChange}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
          </CFormSelect>
        </CCol>
        <CCol md={1} className="d-flex gap-2">
          <CButton color="primary" className="w-100" onClick={onSearch}>
            Filtrar
          </CButton>
          <CButton color="secondary" variant="outline" className="w-100" onClick={onReset}>
            Limpar
          </CButton>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
)

export default SettingsCatalogFilters
