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

const FreightAuditTable = ({ items }) => {
  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <CTable hover responsive align="middle">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>OT</CTableHeaderCell>
              <CTableHeaderCell>Transportadora</CTableHeaderCell>
              <CTableHeaderCell>Contratado</CTableHeaderCell>
              <CTableHeaderCell>Cobrado</CTableHeaderCell>
              <CTableHeaderCell>Diferenca</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Data auditoria</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {items.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={8} className="text-center text-body-secondary py-4">
                  Nenhuma auditoria encontrada com os filtros informados.
                </CTableDataCell>
              </CTableRow>
            ) : (
              items.map((item) => {
                const isDivergence = Number(item.diferenca_valor || 0) !== 0 || item.status_auditoria === 'divergente'

                return (
                  <CTableRow key={item.id} className={isDivergence ? 'table-danger' : undefined}>
                    <CTableDataCell className="fw-semibold">{item.numero_ot}</CTableDataCell>
                    <CTableDataCell>{item.transporter_name}</CTableDataCell>
                    <CTableDataCell>{formatCurrency(item.valor_contratado)}</CTableDataCell>
                    <CTableDataCell>{formatCurrency(item.valor_cobrado)}</CTableDataCell>
                    <CTableDataCell className={isDivergence ? 'text-danger fw-semibold' : 'text-success fw-semibold'}>
                      {formatCurrency(item.diferenca_valor)}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CrudStatusBadge status={item.status_auditoria} />
                    </CTableDataCell>
                    <CTableDataCell>{new Date(item.data_auditoria).toLocaleString('pt-BR')}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      <div className="d-inline-flex gap-2">
                        <CButton color="secondary" variant="outline" size="sm" as={Link} to={`/control/freight-audits/${item.id}`}>
                          Detalhes
                        </CButton>
                        <CButton color="info" variant="outline" size="sm" as={Link} to={`/control/freight-audits/${item.id}/edit`}>
                          Editar
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                )
              })
            )}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default FreightAuditTable
