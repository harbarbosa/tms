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
import { tripDocumentTypes } from '../utils/tripDocumentValidation'

const TripDocumentFilters = ({ filters, options, onChange, onSearch, onReset }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CRow className="g-3 align-items-end">
          <CCol lg={4} md={6}>
            <label className="form-label">Busca</label>
            <CFormInput
              name="search"
              value={filters.search}
              onChange={onChange}
              placeholder="Numero, arquivo ou OT"
            />
          </CCol>
          <CCol lg={3} md={6}>
            <label className="form-label">Tipo</label>
            <CFormSelect name="tipo_documento" value={filters.tipo_documento} onChange={onChange}>
              <option value="">Todos</option>
              {tripDocumentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol lg={3} md={6}>
            <label className="form-label">OT</label>
            <CFormSelect name="ordem_transporte_id" value={filters.ordem_transporte_id} onChange={onChange}>
              <option value="">Todas</option>
              {(options.transport_documents || []).map((document) => (
                <option key={document.id} value={document.id}>
                  {document.numero_ot}
                </option>
              ))}
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

export default TripDocumentFilters
