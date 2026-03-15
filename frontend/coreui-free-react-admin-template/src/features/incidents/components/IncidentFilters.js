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
import { incidentStatuses, incidentTypes } from '../utils/incidentValidation'

const IncidentFilters = ({ filters, onChange, onSearch, onReset }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CRow className="g-3 align-items-end">
          <CCol lg={4} md={6}>
            <label className="form-label">Busca</label>
            <CFormInput name="search" value={filters.search} onChange={onChange} placeholder="OT, transportadora ou observacoes" />
          </CCol>
          <CCol lg={3} md={6}>
            <label className="form-label">Tipo</label>
            <CFormSelect name="tipo_ocorrencia" value={filters.tipo_ocorrencia} onChange={onChange}>
              <option value="">Todos</option>
              {incidentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol lg={3} md={6}>
            <label className="form-label">Status</label>
            <CFormSelect name="status" value={filters.status} onChange={onChange}>
              <option value="">Todos</option>
              {incidentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol lg={2} md={6}>
            <label className="form-label">Por pagina</label>
            <CFormSelect name="perPage" value={filters.perPage} onChange={onChange}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </CFormSelect>
          </CCol>
          <CCol xs={12} className="d-flex justify-content-end gap-2">
            <CButton color="primary" onClick={onSearch}>
              Filtrar
            </CButton>
            <CButton color="secondary" variant="outline" onClick={onReset}>
              Limpar
            </CButton>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default IncidentFilters
