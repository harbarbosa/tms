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
import { quotationStatuses } from '../utils/freightQuotationValidation'

const FreightQuotationFilters = ({ filters, onChange, onSearch, onReset }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CRow className="g-3 align-items-end">
          <CCol lg={3} md={6}>
            <label className="form-label">Busca</label>
            <CFormInput name="search" value={filters.search} onChange={onChange} placeholder="Observacoes ou tipo" />
          </CCol>
          <CCol lg={2} md={6}>
            <label className="form-label">Tipo referencia</label>
            <CFormSelect name="tipo_referencia" value={filters.tipo_referencia} onChange={onChange}>
              <option value="">Todos</option>
              <option value="pedido">Pedido</option>
              <option value="carga">Carga</option>
            </CFormSelect>
          </CCol>
          <CCol lg={2} md={6}>
            <label className="form-label">Status</label>
            <CFormSelect name="status" value={filters.status} onChange={onChange}>
              <option value="">Todos</option>
              {quotationStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol lg={2} md={6}>
            <label className="form-label">Enviado de</label>
            <CFormInput type="date" name="data_envio_inicio" value={filters.data_envio_inicio} onChange={onChange} />
          </CCol>
          <CCol lg={2} md={6}>
            <label className="form-label">Enviado ate</label>
            <CFormInput type="date" name="data_envio_fim" value={filters.data_envio_fim} onChange={onChange} />
          </CCol>
          <CCol lg={1} md={6}>
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

export default FreightQuotationFilters
