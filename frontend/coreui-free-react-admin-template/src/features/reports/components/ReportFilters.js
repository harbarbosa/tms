import React from 'react'
import { CButton, CCard, CCardBody, CCol, CFormInput, CFormLabel, CFormSelect, CRow } from '@coreui/react'

const ReportFilters = ({ filters, companies, transporters, statusOptions, onChange, onSearch, onReset, onExport }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardBody>
      <CRow className="g-3 align-items-end">
        <CCol md={2}>
          <CFormLabel>Inicio</CFormLabel>
          <CFormInput type="date" name="start_date" value={filters.start_date} onChange={onChange} />
        </CCol>
        <CCol md={2}>
          <CFormLabel>Fim</CFormLabel>
          <CFormInput type="date" name="end_date" value={filters.end_date} onChange={onChange} />
        </CCol>
        <CCol md={2}>
          <CFormLabel>Empresa</CFormLabel>
          <CFormSelect name="company_id" value={filters.company_id} onChange={onChange}>
            <option value="">Todas</option>
            {companies.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <CFormLabel>Transportadora</CFormLabel>
          <CFormSelect name="transporter_id" value={filters.transporter_id} onChange={onChange}>
            <option value="">Todas</option>
            {transporters.map((item) => (
              <option key={item.id} value={item.id}>
                {item.razao_social}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <CFormLabel>Status</CFormLabel>
          <CFormSelect name="status" value={filters.status} onChange={onChange}>
            <option value="">Todos</option>
            {statusOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={1}>
          <CFormLabel>Pg</CFormLabel>
          <CFormSelect name="perPage" value={filters.perPage} onChange={onChange}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
          </CFormSelect>
        </CCol>
        <CCol md={1}>
          <div className="d-grid gap-2">
            <CButton color="primary" onClick={onSearch}>
              Aplicar
            </CButton>
          </div>
        </CCol>
        <CCol md={12}>
          <div className="d-flex gap-2 flex-wrap">
            <CButton color="light" onClick={onReset}>
              Limpar
            </CButton>
            <CButton color="success" variant="outline" onClick={onExport}>
              Exportar CSV
            </CButton>
            <CButton color="secondary" variant="outline" disabled>
              XLSX em breve
            </CButton>
          </div>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
)

export default ReportFilters
