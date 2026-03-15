import React from 'react'
import { CBadge } from '@coreui/react'

const statusMap = {
  active: { color: 'success', label: 'Ativa' },
  inactive: { color: 'secondary', label: 'Inativa' },
  pendente: { color: 'warning', label: 'Pendente' },
  em_planejamento: { color: 'info', label: 'Em planejamento' },
  cotacao: { color: 'primary', label: 'Cotacao' },
  contratado: { color: 'info', label: 'Contratado' },
  em_transporte: { color: 'primary', label: 'Em transporte' },
  entregue: { color: 'success', label: 'Entregue' },
  cancelado: { color: 'danger', label: 'Cancelado' },
  planejada: { color: 'secondary', label: 'Planejada' },
  em_montagem: { color: 'warning', label: 'Em montagem' },
  pronta: { color: 'info', label: 'Pronta' },
  cancelada: { color: 'danger', label: 'Cancelada' },
  rascunho: { color: 'secondary', label: 'Rascunho' },
  enviada: { color: 'info', label: 'Enviada' },
  em_analise: { color: 'warning', label: 'Em analise' },
  respondida: { color: 'info', label: 'Respondida' },
  recusada: { color: 'danger', label: 'Recusada' },
  aprovada: { color: 'success', label: 'Aprovada' },
  expirada: { color: 'dark', label: 'Expirada' },
  programada: { color: 'info', label: 'Programada' },
  em_coleta: { color: 'warning', label: 'Em coleta' },
  em_transito: { color: 'primary', label: 'Em transito' },
  finalizada: { color: 'success', label: 'Finalizada' },
  aguardando_coleta: { color: 'secondary', label: 'Aguardando coleta' },
  coletado: { color: 'info', label: 'Coletado' },
  em_entrega: { color: 'warning', label: 'Em entrega' },
  com_ocorrencia: { color: 'danger', label: 'Com ocorrencia' },
  aberta: { color: 'danger', label: 'Aberta' },
  em_tratativa: { color: 'warning', label: 'Em tratativa' },
  resolvida: { color: 'success', label: 'Resolvida' },
  divergente: { color: 'danger', label: 'Divergente' },
}

const CrudStatusBadge = ({ status }) => {
  const current = statusMap[status] || { color: 'warning', label: status || 'N/A' }

  return <CBadge color={current.color}>{current.label}</CBadge>
}

export default CrudStatusBadge
