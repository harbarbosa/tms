import React from 'react'
import { CButton, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CrudStatusBadge from '../../../components/crud/CrudStatusBadge'

const SettingsCatalogTable = ({ items, catalogTypes, onEdit, onToggleStatus }) => {
  const labelsByType = (catalogTypes || []).reduce((accumulator, item) => {
    accumulator[item.key] = `${item.section} - ${item.label}`
    return accumulator
  }, {})

  return (
    <CTable responsive hover align="middle" className="bg-white shadow-sm rounded overflow-hidden">
      <CTableHead color="light">
        <CTableRow>
          <CTableHeaderCell>Catalogo</CTableHeaderCell>
          <CTableHeaderCell>Escopo</CTableHeaderCell>
          <CTableHeaderCell>Codigo</CTableHeaderCell>
          <CTableHeaderCell>Nome</CTableHeaderCell>
          <CTableHeaderCell>Ordenacao</CTableHeaderCell>
          <CTableHeaderCell>Status</CTableHeaderCell>
          <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {items.length === 0 ? (
          <CTableRow>
            <CTableDataCell colSpan={7} className="text-center py-4 text-body-secondary">
              Nenhum item de catalogo encontrado.
            </CTableDataCell>
          </CTableRow>
        ) : (
          items.map((item) => (
            <CTableRow key={item.id}>
              <CTableDataCell>{labelsByType[item.catalog_type] || item.catalog_type}</CTableDataCell>
              <CTableDataCell>{item.scope === 'global' ? 'Global' : 'Empresa'}</CTableDataCell>
              <CTableDataCell>{item.code}</CTableDataCell>
              <CTableDataCell>
                <div>{item.label}</div>
                {item.description ? <small className="text-body-secondary">{item.description}</small> : null}
              </CTableDataCell>
              <CTableDataCell>{item.sort_order}</CTableDataCell>
              <CTableDataCell>
                <CrudStatusBadge status={item.status} />
              </CTableDataCell>
              <CTableDataCell className="text-end">
                <div className="d-inline-flex gap-2">
                  <CButton color="info" size="sm" variant="outline" onClick={() => onEdit(item)}>
                    Editar
                  </CButton>
                  <CButton
                    color={item.status === 'active' ? 'warning' : 'success'}
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleStatus(item)}
                  >
                    {item.status === 'active' ? 'Inativar' : 'Ativar'}
                  </CButton>
                </div>
              </CTableDataCell>
            </CTableRow>
          ))
        )}
      </CTableBody>
    </CTable>
  )
}

export default SettingsCatalogTable
