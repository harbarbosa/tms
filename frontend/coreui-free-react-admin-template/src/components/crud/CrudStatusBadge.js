import React from 'react'
import { CBadge } from '@coreui/react'

const statusMap = {
  active: { color: 'success', label: 'Ativa' },
  inactive: { color: 'secondary', label: 'Inativa' },
  pendente: { color: 'warning', label: 'Pendente' },
  em_planejamento: { color: 'info', label: 'Em planejamento' },
  cotacao: { color: 'primary', label: 'Cotacao' },
  contratado: { color: 'info', label: 'Contratado' },
  convertido_em_ot: { color: 'success', label: 'Convertido em OT' },
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
  agendado: { color: 'secondary', label: 'Agendado' },
  confirmado: { color: 'info', label: 'Confirmado' },
  em_atendimento: { color: 'warning', label: 'Em atendimento' },
  concluido: { color: 'success', label: 'Concluido' },
  ausente: { color: 'danger', label: 'Ausente' },
  aguardando: { color: 'secondary', label: 'Aguardando' },
  chegou: { color: 'info', label: 'Chegou' },
  em_doca: { color: 'warning', label: 'Em doca' },
  carregando: { color: 'primary', label: 'Carregando' },
  finalizado: { color: 'success', label: 'Finalizado' },
  recusado: { color: 'danger', label: 'Recusado' },
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
  bloqueado: { color: 'danger', label: 'Bloqueado' },
  liberado: { color: 'info', label: 'Liberado' },
  pago: { color: 'success', label: 'Pago' },
  no_prazo: { color: 'success', label: 'No prazo' },
  fora_do_prazo: { color: 'danger', label: 'Fora do prazo' },
  critico: { color: 'danger', label: 'Critico' },
}

const formatFallbackLabel = (status) =>
  String(status || 'N/A')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const CrudStatusBadge = ({ status }) => {
  const current = statusMap[status] || { color: 'warning', label: formatFallbackLabel(status) }

  return (
    <CBadge color={current.color} shape="rounded-pill" className="px-3 py-2 fw-semibold">
      {current.label}
    </CBadge>
  )
}

export default CrudStatusBadge
