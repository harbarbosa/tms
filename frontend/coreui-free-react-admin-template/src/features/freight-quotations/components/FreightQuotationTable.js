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

const FreightQuotationTable = ({ items, onDelete, canEdit = true, canDelete = true }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CTable hover responsive align="middle">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Referencia</CTableHeaderCell>
              <CTableHeaderCell>Tipo</CTableHeaderCell>
              <CTableHeaderCell>Descricao</CTableHeaderCell>
              <CTableHeaderCell>Janela</CTableHeaderCell>
              <CTableHeaderCell>Propostas</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {items.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={7} className="text-center text-body-secondary py-4">
                  Nenhuma cotacao encontrada com os filtros informados.
                </CTableDataCell>
              </CTableRow>
            ) : (
              items.map((item) => (
                <CTableRow key={item.id}>
                  <CTableDataCell className="fw-semibold">{item.reference_summary?.label || '-'}</CTableDataCell>
                  <CTableDataCell className="text-capitalize">{item.tipo_referencia}</CTableDataCell>
                  <CTableDataCell>{item.reference_summary?.description || item.observacoes || '-'}</CTableDataCell>
                  <CTableDataCell>
                    <div>{item.data_envio}</div>
                    <small className="text-body-secondary">ate {item.data_limite_resposta}</small>
                  </CTableDataCell>
                  <CTableDataCell>{item.proposals_count || 0}</CTableDataCell>
                  <CTableDataCell>
                    <CrudStatusBadge status={item.status} />
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-inline-flex gap-2">
                      <CButton color="secondary" variant="outline" size="sm" as={Link} to={`/operations/freight-quotations/${item.id}`}>
                        Acompanhar
                      </CButton>
                      {canEdit ? (
                        <CButton color="info" variant="outline" size="sm" as={Link} to={`/operations/freight-quotations/${item.id}/edit`}>
                          Editar
                        </CButton>
                      ) : null}
                      {canDelete ? (
                        <CButton color="danger" variant="outline" size="sm" onClick={() => onDelete(item)}>
                          Excluir
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
}

export default FreightQuotationTable
