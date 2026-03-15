import React from 'react'
import { CButton, CCard, CCardBody, CCol, CFormInput, CRow } from '@coreui/react'

const DashboardFilters = ({ filters, onChange, onApply, onCurrentMonth }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CRow className="g-3 align-items-end">
          <CCol md={4}>
            <label className="form-label">Periodo inicial</label>
            <CFormInput type="date" name="start_date" value={filters.start_date} onChange={onChange} />
          </CCol>
          <CCol md={4}>
            <label className="form-label">Periodo final</label>
            <CFormInput type="date" name="end_date" value={filters.end_date} onChange={onChange} />
          </CCol>
          <CCol md={4} className="d-flex gap-2">
            <CButton color="primary" className="w-100" onClick={onApply}>
              Aplicar filtros
            </CButton>
            <CButton color="secondary" variant="outline" className="w-100" onClick={onCurrentMonth}>
              Mes atual
            </CButton>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default DashboardFilters
