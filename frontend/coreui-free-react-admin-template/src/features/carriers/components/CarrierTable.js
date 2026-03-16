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
import CrudTableEmptyState from '../../../components/crud/CrudTableEmptyState'

const CarrierTable = ({ items, onDelete, canEdit = true, canDelete = true }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CTable hover responsive align="middle">
          <CTableHead color="light">
            <CTableRow>
              <CTableHeaderCell>Razao social</CTableHeaderCell>
              <CTableHeaderCell>Nome fantasia</CTableHeaderCell>
              <CTableHeaderCell>CNPJ</CTableHeaderCell>
              <CTableHeaderCell>Cidade/UF</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {items.length === 0 ? (
              <CrudTableEmptyState
                colSpan={6}
                title="Nenhuma transportadora encontrada."
                description="Ajuste os filtros ou cadastre uma nova transportadora para continuar."
              />
            ) : (
              items.map((item) => (
                <CTableRow key={item.id}>
                  <CTableDataCell>
                    <div className="fw-semibold">{item.razao_social}</div>
                    {item.email ? <small className="text-body-secondary">{item.email}</small> : null}
                  </CTableDataCell>
                  <CTableDataCell>{item.nome_fantasia || '-'}</CTableDataCell>
                  <CTableDataCell>{item.cnpj || '-'}</CTableDataCell>
                  <CTableDataCell>{[item.cidade, item.estado].filter(Boolean).join('/') || '-'}</CTableDataCell>
                  <CTableDataCell>
                    <CrudStatusBadge status={item.status} />
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-inline-flex gap-2">
                      {canEdit ? (
                        <CButton
                          color="info"
                          variant="outline"
                          size="sm"
                          as={Link}
                          to={`/registry/carriers/${item.id}/edit`}
                        >
                          Editar
                        </CButton>
                      ) : null}
                      {canDelete ? (
                        <CButton color="danger" variant="ghost" size="sm" onClick={() => onDelete(item)}>
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

export default CarrierTable
