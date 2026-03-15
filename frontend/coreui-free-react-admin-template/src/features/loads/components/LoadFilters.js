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
import { loadStatuses } from '../utils/loadValidation'

const LoadFilters = ({ filters, onChange, onSearch, onReset }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CRow className="g-3 align-items-end">
          <CCol lg={3} md={6}>
            <label className="form-label">Busca geral</label>
            <CFormInput
              name="search"
              placeholder="Codigo, origem ou destino"
              value={filters.search}
              onChange={onChange}
            />
          </CCol>
          <CCol lg={2} md={6}>
            <label className="form-label">Origem</label>
            <CFormInput
              name="origem"
              placeholder="Nome ou cidade"
              value={filters.origem}
              onChange={onChange}
            />
          </CCol>
          <CCol lg={2} md={6}>
            <label className="form-label">Destino</label>
            <CFormInput
              name="destino"
              placeholder="Nome ou cidade"
              value={filters.destino}
              onChange={onChange}
            />
          </CCol>
          <CCol lg={2} md={6}>
            <label className="form-label">Status</label>
            <CFormSelect name="status" value={filters.status} onChange={onChange}>
              <option value="">Todos</option>
              {loadStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol lg={1} md={6}>
            <label className="form-label">Saida de</label>
            <CFormInput type="date" name="data_inicio" value={filters.data_inicio} onChange={onChange} />
          </CCol>
          <CCol lg={1} md={6}>
            <label className="form-label">Entrega ate</label>
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
          <CCol xs={12} className="d-flex gap-2 justify-content-end">
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

export default LoadFilters
