import React from 'react'
import {
  CCard,
  CCardBody,
  CFormCheck,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

const PermissionMatrixTable = ({ actions, modules, selectedPermissionIds, canManage, onToggle }) => (
  <CCard className="shadow-sm border-0">
    <CCardBody>
      <CTable responsive bordered hover align="middle">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Modulo</CTableHeaderCell>
            {actions.map((action) => (
              <CTableHeaderCell key={action.key} className="text-center">
                {action.label}
              </CTableHeaderCell>
            ))}
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {modules.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={actions.length + 1} className="text-center text-body-secondary py-4">
                Nenhuma permissao encontrada para os filtros informados.
              </CTableDataCell>
            </CTableRow>
          ) : (
            modules.map((moduleRow) => (
              <CTableRow key={moduleRow.module}>
                <CTableDataCell className="fw-semibold">{moduleRow.label}</CTableDataCell>
                {actions.map((action) => {
                  const permission = moduleRow.actions[action.key]

                  return (
                    <CTableDataCell key={`${moduleRow.module}-${action.key}`} className="text-center">
                      {permission ? (
                        <div className="d-flex justify-content-center">
                          <CFormCheck
                            checked={selectedPermissionIds.includes(permission.id)}
                            disabled={!canManage}
                            onChange={() => onToggle(permission.id)}
                          />
                        </div>
                      ) : (
                        <span className="text-body-secondary">-</span>
                      )}
                    </CTableDataCell>
                  )
                })}
              </CTableRow>
            ))
          )}
        </CTableBody>
      </CTable>
    </CCardBody>
  </CCard>
)

export default PermissionMatrixTable
