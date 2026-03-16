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

const CarrierFilters = ({ filters, onChange, onSearch, onReset }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <div className="fw-semibold">Filtros</div>
            <div className="small text-body-secondary">Refine a listagem por busca, status e volume por pagina.</div>
          </div>
        </div>
        <CRow className="g-3 align-items-end">
          <CCol md={5}>
            <label className="form-label">Buscar</label>
            <CFormInput
              name="search"
              placeholder="Razao social, nome fantasia, CNPJ ou cidade"
              value={filters.search}
              onChange={onChange}
            />
          </CCol>
          <CCol md={3}>
            <label className="form-label">Status</label>
            <CFormSelect name="status" value={filters.status} onChange={onChange}>
              <option value="">Todos</option>
              <option value="active">Ativa</option>
              <option value="inactive">Inativa</option>
            </CFormSelect>
          </CCol>
          <CCol md={2}>
            <label className="form-label">Por pagina</label>
            <CFormSelect name="perPage" value={filters.perPage} onChange={onChange}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </CFormSelect>
          </CCol>
          <CCol md={2} className="d-flex gap-2">
            <CButton color="primary" className="w-100" onClick={onSearch}>
              Filtrar
            </CButton>
            <CButton color="secondary" variant="ghost" className="w-100" onClick={onReset}>
              Limpar
            </CButton>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default CarrierFilters
