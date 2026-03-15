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
import { freightAuditStatuses } from '../utils/freightAuditValidation'

const FreightAuditFilters = ({ filters, onChange, onSearch, onReset }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CRow className="g-3 align-items-end">
          <CCol lg={3} md={6}>
            <label className="form-label">Busca</label>
            <CFormInput name="search" value={filters.search} onChange={onChange} placeholder="OT, transportadora ou auditor" />
          </CCol>
          <CCol lg={2} md={6}>
            <label className="form-label">Status</label>
            <CFormSelect name="status" value={filters.status} onChange={onChange}>
              <option value="">Todos</option>
              {freightAuditStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol lg={2} md={6}>
            <label className="form-label">Data inicio</label>
            <CFormInput type="date" name="data_inicio" value={filters.data_inicio} onChange={onChange} />
          </CCol>
          <CCol lg={2} md={6}>
            <label className="form-label">Data fim</label>
            <CFormInput type="date" name="data_fim" value={filters.data_fim} onChange={onChange} />
          </CCol>
          <CCol lg={1} md={6}>
            <label className="form-label">Por pagina</label>
            <CFormSelect name="perPage" value={filters.perPage} onChange={onChange}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </CFormSelect>
          </CCol>
          <CCol lg={2} md={6} className="d-flex gap-2">
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

export default FreightAuditFilters
