import React from 'react'
import {
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

const formatValue = (value, type) => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (type === 'currency') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))
  }

  if (type === 'decimal') {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))
  }

  if (type === 'number') {
    return new Intl.NumberFormat('pt-BR').format(Number(value || 0))
  }

  return value
}

const ReportTable = ({ columns, items }) => (
  <CCard className="shadow-sm border-0">
    <CCardBody className="p-0">
      <CTable hover responsive className="mb-0">
        <CTableHead>
          <CTableRow>
            {columns.map((column) => (
              <CTableHeaderCell key={column.key}>{column.label}</CTableHeaderCell>
            ))}
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {items.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={columns.length} className="text-center py-4 text-body-secondary">
                Nenhum dado encontrado para os filtros selecionados.
              </CTableDataCell>
            </CTableRow>
          ) : (
            items.map((item, index) => (
              <CTableRow key={item.id || `${item.status || item.tipo_ocorrencia || 'row'}-${index}`}>
                {columns.map((column) => (
                  <CTableDataCell key={column.key}>
                    {column.type === 'status' ? (
                      <CrudStatusBadge status={item[column.key]} />
                    ) : (
                      formatValue(item[column.key], column.type)
                    )}
                  </CTableDataCell>
                ))}
              </CTableRow>
            ))
          )}
        </CTableBody>
      </CTable>
    </CCardBody>
  </CCard>
)

export default ReportTable
