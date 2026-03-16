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

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const FinancialTable = ({ items }) => (
  <CCard className="shadow-sm border-0">
    <CCardBody className="p-0">
      <CTable align="middle" hover responsive className="mb-0">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>OT</CTableHeaderCell>
            <CTableHeaderCell>Transportadora</CTableHeaderCell>
            <CTableHeaderCell>Previsto</CTableHeaderCell>
            <CTableHeaderCell>Aprovado</CTableHeaderCell>
            <CTableHeaderCell>Prev. pagamento</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Alertas</CTableHeaderCell>
            <CTableHeaderCell className="text-end">Acoes</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {items.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={8} className="text-center py-4 text-body-secondary">
                Nenhum lancamento financeiro encontrado.
              </CTableDataCell>
            </CTableRow>
          ) : (
            items.map((item) => (
              <CTableRow key={item.id}>
                <CTableDataCell>{item.numero_ot}</CTableDataCell>
                <CTableDataCell>{item.transporter_name}</CTableDataCell>
                <CTableDataCell>{formatCurrency(item.valor_previsto)}</CTableDataCell>
                <CTableDataCell>{item.valor_aprovado ? formatCurrency(item.valor_aprovado) : '-'}</CTableDataCell>
                <CTableDataCell>{item.data_prevista_pagamento || '-'}</CTableDataCell>
                <CTableDataCell>
                  <CrudStatusBadge status={item.status} />
                </CTableDataCell>
                <CTableDataCell>
                  <div className="d-flex gap-2 justify-content-start flex-wrap">
                    {item.operational_flags?.blocked_by_divergence ? <CBadge color="danger">Divergencia</CBadge> : null}
                    {item.approval_pending ? <CBadge color="warning">Aguardando aprovacao</CBadge> : null}
                  </div>
                </CTableDataCell>
                <CTableDataCell className="text-end">
                  <CButton color="secondary" size="sm" variant="outline" as={Link} to={`/financial/${item.id}`}>
                    Detalhes
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))
          )}
        </CTableBody>
      </CTable>
    </CCardBody>
  </CCard>
)

export default FinancialTable
