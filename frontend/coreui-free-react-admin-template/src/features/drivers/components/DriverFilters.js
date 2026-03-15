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

const DriverFilters = ({ filters, carriers, onChange, onSearch, onReset }) => {
  return (
    <CCard className="mb-4">
      <CCardBody>
        <CRow className="g-3 align-items-end">
          <CCol md={4}>
            <label className="form-label">Buscar</label>
            <CFormInput
              name="search"
              placeholder="Nome, CPF ou CNH"
              value={filters.search}
              onChange={onChange}
            />
          </CCol>
          <CCol md={3}>
            <label className="form-label">Transportadora</label>
            <CFormSelect name="transporter_id" value={filters.transporter_id} onChange={onChange}>
              <option value="">Todas</option>
              {carriers.map((carrier) => (
                <option key={carrier.id} value={carrier.id}>
                  {carrier.nome_fantasia || carrier.razao_social}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol md={2}>
            <label className="form-label">Status</label>
            <CFormSelect name="status" value={filters.status} onChange={onChange}>
              <option value="">Todos</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
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
          <CCol md={2} className="d-flex gap-2">
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
}

export default DriverFilters
