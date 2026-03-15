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
import { transportDocumentStatuses } from '../utils/transportDocumentValidation'

const TransportDocumentFilters = ({ filters, options, onChange, onSearch, onReset }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CRow className="g-3 align-items-end">
          <CCol lg={3} md={6}>
            <label className="form-label">Busca</label>
            <CFormInput
              name="search"
              value={filters.search}
              onChange={onChange}
              placeholder="Numero OT, transportadora, carga ou pedido"
            />
          </CCol>
          <CCol lg={2} md={6}>
            <label className="form-label">Transportadora</label>
            <CFormSelect name="transporter_id" value={filters.transporter_id} onChange={onChange}>
              <option value="">Todas</option>
              {(options.transporters || []).map((transporter) => (
                <option key={transporter.id} value={transporter.id}>
                  {transporter.razao_social}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol lg={2} md={6}>
            <label className="form-label">Status</label>
            <CFormSelect name="status" value={filters.status} onChange={onChange}>
              <option value="">Todos</option>
              {transportDocumentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol lg={2} md={6}>
            <label className="form-label">Carga</label>
            <CFormSelect name="carga_id" value={filters.carga_id} onChange={onChange}>
              <option value="">Todas</option>
              {(options.loads || []).map((load) => (
                <option key={load.id} value={load.id}>
                  {load.codigo_carga}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol lg={2} md={6}>
            <label className="form-label">Pedido</label>
            <CFormSelect name="pedido_id" value={filters.pedido_id} onChange={onChange}>
              <option value="">Todos</option>
              {(options.transport_orders || []).map((order) => (
                <option key={order.id} value={order.id}>
                  {order.numero_pedido}
                </option>
              ))}
            </CFormSelect>
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

export default TransportDocumentFilters
