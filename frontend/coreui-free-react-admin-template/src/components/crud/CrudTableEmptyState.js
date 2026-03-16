import React from 'react'
import { CTableDataCell, CTableRow } from '@coreui/react'

const CrudTableEmptyState = ({ colSpan, title = 'Nenhum registro encontrado.', description = 'Ajuste os filtros ou crie um novo item para continuar.' }) => (
  <CTableRow>
    <CTableDataCell colSpan={colSpan} className="text-center py-5">
      <div className="fw-semibold mb-1">{title}</div>
      <div className="text-body-secondary small">{description}</div>
    </CTableDataCell>
  </CTableRow>
)

export default CrudTableEmptyState
