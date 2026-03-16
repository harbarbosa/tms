import React from 'react'
import { Link } from 'react-router-dom'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CrudStatusBadge from '../../../components/crud/CrudStatusBadge'

const scopeLabelMap = {
  global: 'Global',
  company: 'Empresa',
  carrier: 'Transportadora',
  driver: 'Motorista',
}

const RoleTable = ({ items, canManage, onToggleStatus, onDuplicate }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardBody>
      <CTable hover responsive align="middle">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Perfil</CTableHeaderCell>
            <CTableHeaderCell>Escopo</CTableHeaderCell>
            <CTableHeaderCell>Permissoes</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {items.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={5} className="text-center text-body-secondary py-4">
                Nenhum perfil encontrado com os filtros informados.
              </CTableDataCell>
            </CTableRow>
          ) : (
            items.map((item) => (
              <CTableRow key={item.id}>
                <CTableDataCell>
                  <div className="fw-semibold">{item.name}</div>
                  <div className="small text-body-secondary">{item.description || '-'}</div>
                  {item.is_system ? <CBadge color="dark" className="mt-1">Sistema</CBadge> : null}
                </CTableDataCell>
                <CTableDataCell>{scopeLabelMap[item.scope] || item.scope || '-'}</CTableDataCell>
                <CTableDataCell>{item.permission_count || 0}</CTableDataCell>
                <CTableDataCell>
                  <CrudStatusBadge status={item.status} />
                </CTableDataCell>
                <CTableDataCell className="text-end">
                  <div className="d-inline-flex gap-2 flex-wrap justify-content-end">
                    {canManage ? (
                      <CButton color="info" variant="outline" size="sm" as={Link} to={`/admin/roles/${item.id}/edit`}>
                        Editar
                      </CButton>
                    ) : null}
                    {canManage ? (
                      <CButton color="dark" variant="outline" size="sm" onClick={() => onDuplicate(item)}>
                        Duplicar
                      </CButton>
                    ) : null}
                    {canManage ? (
                      <CButton
                        color={item.status === 'active' ? 'warning' : 'success'}
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleStatus(item)}
                      >
                        {item.status === 'active' ? 'Inativar' : 'Ativar'}
                      </CButton>
                    ) : null}
                  </div>
                </CTableDataCell>
              </CTableRow>
            ))
          )}
        </CTableBody>
      </CTable>
    </CCardBody>
  </CCard>
)

export default RoleTable
