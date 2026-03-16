import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CFormLabel,
  CFormSelect,
  CFormInput,
  CRow,
} from '@coreui/react'

const FinancialFilters = ({ filters, options, onChange, onSearch, onReset }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardBody>
      <CRow className="g-3 align-items-end">
        <CCol md={3}>
          <CFormLabel>Transportadora</CFormLabel>
          <CFormSelect name="transporter_id" value={filters.transporter_id} onChange={onChange}>
            <option value="">Todas</option>
            {(options.transporters || []).map((item) => (
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
            {(options.statusOptions || []).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <CFormLabel>Pendencia aprov.</CFormLabel>
          <CFormSelect name="approval_pending" value={filters.approval_pending} onChange={onChange}>
            <option value="">Todas</option>
            <option value="1">Somente pendentes</option>
            <option value="0">Somente concluidas</option>
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <CFormLabel>Empresa</CFormLabel>
          <CFormSelect name="company_id" value={filters.company_id} onChange={onChange}>
            <option value="">Todas</option>
            {(options.companies || []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome_fantasia || item.razao_social}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <CFormLabel>Inicio</CFormLabel>
          <CFormInput type="date" name="data_inicio" value={filters.data_inicio} onChange={onChange} />
        </CCol>
        <CCol md={2}>
          <CFormLabel>Fim</CFormLabel>
          <CFormInput type="date" name="data_fim" value={filters.data_fim} onChange={onChange} />
        </CCol>
        <CCol md={1}>
          <CFormLabel>Pg</CFormLabel>
          <CFormSelect name="perPage" value={filters.perPage} onChange={onChange}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
          </CFormSelect>
        </CCol>
        <CCol md={4}>
          <div className="d-flex gap-2">
            <CButton color="primary" onClick={onSearch}>
              Aplicar
            </CButton>
            <CButton color="light" onClick={onReset}>
              Limpar
            </CButton>
          </div>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
)

export default FinancialFilters
