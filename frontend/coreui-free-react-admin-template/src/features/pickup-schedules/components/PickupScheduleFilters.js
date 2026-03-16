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

const PickupScheduleFilters = ({ filters, options, onChange, onSearch, onReset }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardBody>
      <CRow className="g-3 align-items-end">
        <CCol md={3}>
          <CFormLabel>Data inicial</CFormLabel>
          <CFormInput type="date" name="data_inicio" value={filters.data_inicio} onChange={onChange} />
        </CCol>
        <CCol md={3}>
          <CFormLabel>Data final</CFormLabel>
          <CFormInput type="date" name="data_fim" value={filters.data_fim} onChange={onChange} />
        </CCol>
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
        <CCol md={3}>
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
        <CCol md={4}>
          <CFormLabel>Unidade</CFormLabel>
          <CFormInput
            list="pickup-schedule-unit-options"
            name="unidade_origem"
            value={filters.unidade_origem}
            onChange={onChange}
            placeholder="Ex.: CD Sao Paulo"
          />
          <datalist id="pickup-schedule-unit-options">
            {(options.unitOptions || []).map((unit) => (
              <option key={unit} value={unit} />
            ))}
          </datalist>
        </CCol>
        <CCol md={2}>
          <CFormLabel>Por pagina</CFormLabel>
          <CFormSelect name="perPage" value={filters.perPage} onChange={onChange}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
          </CFormSelect>
        </CCol>
        <CCol md={3}>
          <div className="d-grid">
            <CButton color="primary" onClick={onSearch}>
              Aplicar filtros
            </CButton>
          </div>
        </CCol>
        <CCol md={3}>
          <div className="d-grid">
            <CButton color="light" onClick={onReset}>
              Limpar
            </CButton>
          </div>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
)

export default PickupScheduleFilters
