import React from 'react'
import { CCol, CWidgetStatsF } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilClipboard, cilTruck, cilWarning, cilDollar, cilSearch } from '@coreui/icons'

const cardsConfig = [
  { key: 'open_orders', title: 'Pedidos em aberto', icon: cilClipboard, color: 'primary' },
  { key: 'loads_in_progress', title: 'Cargas em andamento', icon: cilTruck, color: 'info' },
  { key: 'contracted_freights_month', title: 'Fretes contratados no mes', icon: cilDollar, color: 'success', currency: true },
  { key: 'completed_deliveries', title: 'Entregas concluidas', icon: cilCheckCircle, color: 'success' },
  { key: 'open_incidents', title: 'Ocorrencias abertas', icon: cilWarning, color: 'danger' },
  { key: 'pending_audits', title: 'Auditorias pendentes', icon: cilSearch, color: 'warning' },
]

const formatValue = (value, currency = false) =>
  currency
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))
    : String(value ?? 0)

const KpiCards = ({ cards = {} }) => {
  return cardsConfig.map((item) => (
    <CCol sm={6} xl={4} xxl={2} key={item.key}>
      <CWidgetStatsF
        className="mb-4 shadow-sm"
        color={item.color}
        icon={<CIcon icon={item.icon} height={24} />}
        title={item.title}
        value={formatValue(cards[item.key], item.currency)}
      />
    </CCol>
  ))
}

export default KpiCards
