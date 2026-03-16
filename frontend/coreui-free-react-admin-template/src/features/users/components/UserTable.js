import React from 'react'
import { Link } from 'react-router-dom'
import {
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

const UserTable = ({ items, canManage, onToggleStatus, onResetPassword }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardBody>
      <CTable hover responsive align="middle">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Usuario</CTableHeaderCell>
            <CTableHeaderCell>Empresa principal</CTableHeaderCell>
            <CTableHeaderCell>Perfil principal</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Ultimo acesso</CTableHeaderCell>
            <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {items.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={6} className="text-center text-body-secondary py-4">
                Nenhum usuario encontrado com os filtros informados.
              </CTableDataCell>
            </CTableRow>
          ) : (
            items.map((item) => (
              <CTableRow key={item.id}>
                <CTableDataCell>
                  <div className="fw-semibold">{item.name}</div>
                  <div className="small text-body-secondary">{item.email}</div>
                </CTableDataCell>
                <CTableDataCell>{item.companies?.[0]?.name || '-'}</CTableDataCell>
                <CTableDataCell>{item.roles?.[0]?.name || '-'}</CTableDataCell>
                <CTableDataCell>
                  <CrudStatusBadge status={item.status} />
                </CTableDataCell>
                <CTableDataCell>
                  {item.last_login_at ? new Date(item.last_login_at).toLocaleString('pt-BR') : 'Nunca acessou'}
                </CTableDataCell>
                <CTableDataCell className="text-end">
                  <div className="d-inline-flex gap-2 flex-wrap justify-content-end">
                    <CButton color="secondary" variant="outline" size="sm" as={Link} to={`/admin/users/${item.id}`}>
                      Detalhes
                    </CButton>
                    {canManage ? (
                      <CButton color="info" variant="outline" size="sm" as={Link} to={`/admin/users/${item.id}/edit`}>
                        Editar
                      </CButton>
                    ) : null}
                    {canManage ? (
                      <CButton color="dark" variant="outline" size="sm" onClick={() => onResetPassword(item)}>
                        Reset senha
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

export default UserTable
