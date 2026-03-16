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

const FreightHiringFilters = ({ filters, options, onChange, onSearch, onReset }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardBody>
      <CRow className="g-3 align-items-end">
        <CCol md={3}>
          <CFormLabel>Busca</CFormLabel>
          <CFormInput name="search" value={filters.search} onChange={onChange} placeholder="Transportadora, observacoes ou comprador" />
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
          <CFormLabel>Tipo</CFormLabel>
          <CFormSelect name="tipo_referencia" value={filters.tipo_referencia} onChange={onChange}>
            <option value="">Todos</option>
            <option value="pedido">Pedido</option>
            <option value="carga">Carga</option>
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
        <CCol md={2}>
          <CFormLabel>Itens por pagina</CFormLabel>
          <CFormSelect name="perPage" value={filters.perPage} onChange={onChange}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </CFormSelect>
        </CCol>
        <CCol md={3}>
          <CFormLabel>Data inicio</CFormLabel>
          <CFormInput type="date" name="data_inicio" value={filters.data_inicio} onChange={onChange} />
        </CCol>
        <CCol md={3}>
          <CFormLabel>Data fim</CFormLabel>
          <CFormInput type="date" name="data_fim" value={filters.data_fim} onChange={onChange} />
        </CCol>
        <CCol xs={12}>
          <div className="d-flex gap-2 justify-content-end">
            <CButton color="secondary" variant="outline" onClick={onReset}>
              Limpar
            </CButton>
            <CButton color="primary" onClick={onSearch}>
              Aplicar filtros
            </CButton>
          </div>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
)

export default FreightHiringFilters
