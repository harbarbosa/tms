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

const VehicleCheckinFilters = ({ filters, options, onChange, onSearch, onReset }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardBody>
      <CRow className="g-3 align-items-end">
        <CCol md={2}>
          <CFormLabel>Data</CFormLabel>
          <CFormInput type="date" name="data" value={filters.data} onChange={onChange} />
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
          <CFormLabel>Veiculo</CFormLabel>
          <CFormSelect name="vehicle_id" value={filters.vehicle_id} onChange={onChange}>
            <option value="">Todos</option>
            {(options.vehicles || []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.placa}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <CFormLabel>Doca</CFormLabel>
          <CFormInput list="vehicle-checkin-docks" name="doca" value={filters.doca} onChange={onChange} />
          <datalist id="vehicle-checkin-docks">
            {(options.dockOptions || []).map((dock) => (
              <option key={dock} value={dock} />
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
        <CCol md={5}>
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

export default VehicleCheckinFilters
