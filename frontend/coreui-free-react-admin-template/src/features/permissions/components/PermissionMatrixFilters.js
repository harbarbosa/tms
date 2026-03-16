import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CFormLabel,
  CFormSelect,
  CRow,
} from '@coreui/react'

const PermissionMatrixFilters = ({ filters, roles, onChange, onSearch }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardBody>
      <CRow className="g-3 align-items-end">
        <CCol md={5}>
          <CFormLabel>Perfil</CFormLabel>
          <CFormSelect name="role_id" value={filters.role_id} onChange={onChange}>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={5}>
          <CFormLabel>Modulo</CFormLabel>
          <CFormSelect name="module" value={filters.module} onChange={onChange}>
            <option value="">Todos</option>
            <option value="companies">Empresas</option>
            <option value="users">Usuarios</option>
            <option value="roles">Perfis</option>
            <option value="permissions">Permissoes</option>
            <option value="carriers">Transportadoras</option>
            <option value="drivers">Motoristas</option>
            <option value="vehicles">Veiculos</option>
            <option value="transport_orders">Pedidos</option>
            <option value="loads">Cargas</option>
            <option value="freight_quotations">Cotacoes</option>
            <option value="freight_hirings">Contratacoes</option>
            <option value="transport_documents">Ordens de transporte</option>
            <option value="pickup_schedules">Agendamentos de coleta</option>
            <option value="vehicle_checkins">Check-ins de veiculo</option>
            <option value="delivery_tracking">Rastreamento</option>
            <option value="incidents">Ocorrencias</option>
            <option value="trip_documents">Documentos</option>
            <option value="proof_of_deliveries">Comprovantes</option>
            <option value="freight_audits">Auditoria</option>
            <option value="financial">Financeiro</option>
            <option value="reports">Relatorios</option>
            <option value="settings">Configuracoes</option>
          </CFormSelect>
        </CCol>
        <CCol md={2}>
          <div className="d-grid">
            <CButton color="primary" onClick={onSearch}>
              Aplicar
            </CButton>
          </div>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
)

export default PermissionMatrixFilters
