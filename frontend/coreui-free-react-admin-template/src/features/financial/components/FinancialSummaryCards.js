import React from 'react'
import { CCard, CCardBody, CCol, CRow } from '@coreui/react'

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const cards = [
  { key: 'pendente', label: 'Pendentes/em analise', color: 'warning' },
  { key: 'bloqueado', label: 'Bloqueados', color: 'danger' },
  { key: 'liberado', label: 'Liberados', color: 'info' },
  { key: 'pago_mes', label: 'Pagos no periodo', color: 'success' },
]

const FinancialSummaryCards = ({ summary }) => (
  <CRow className="g-4 mb-4">
    {cards.map((card) => (
      <CCol sm={6} xl={3} key={card.key}>
        <CCard className={`shadow-sm border-0 border-top border-3 border-${card.color}`}>
          <CCardBody>
            <div className="text-body-secondary small text-uppercase">{card.label}</div>
            <div className="fs-4 fw-semibold mt-2">{formatCurrency(summary?.[card.key])}</div>
          </CCardBody>
        </CCard>
      </CCol>
    ))}
  </CRow>
)

export default FinancialSummaryCards
