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

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const FreightHiringTable = ({ items, canEdit = true }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardBody>
      <CTable hover responsive align="middle">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Referencia</CTableHeaderCell>
            <CTableHeaderCell>Transportadora</CTableHeaderCell>
            <CTableHeaderCell>Valor</CTableHeaderCell>
            <CTableHeaderCell>Prazo</CTableHeaderCell>
            <CTableHeaderCell>Data</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {items.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={7} className="text-center text-body-secondary py-4">
                Nenhuma contratacao encontrada com os filtros informados.
              </CTableDataCell>
            </CTableRow>
          ) : (
            items.map((item) => (
              <CTableRow key={item.id}>
                <CTableDataCell>
                  <div className="fw-semibold">{item.reference_summary?.label || '-'}</div>
                  <div className="small text-body-secondary">{item.reference_summary?.description || '-'}</div>
                </CTableDataCell>
                <CTableDataCell>{item.transporter_name}</CTableDataCell>
                <CTableDataCell>{formatCurrency(item.valor_contratado)}</CTableDataCell>
                <CTableDataCell>{item.prazo_entrega_dias ? `${item.prazo_entrega_dias} dias` : '-'}</CTableDataCell>
                <CTableDataCell>{item.data_contratacao ? new Date(item.data_contratacao).toLocaleString('pt-BR') : '-'}</CTableDataCell>
                <CTableDataCell>
                  <CrudStatusBadge status={item.status} />
                </CTableDataCell>
                <CTableDataCell className="text-end">
                  <div className="d-inline-flex gap-2">
                    <CButton color="secondary" variant="outline" size="sm" as={Link} to={`/operations/freight-hirings/${item.id}`}>
                      Detalhes
                    </CButton>
                    {canEdit ? (
                      <CButton color="info" variant="outline" size="sm" as={Link} to={`/operations/freight-hirings/${item.id}/edit`}>
                        Editar
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

export default FreightHiringTable
