export const trackingStatuses = [
  'aguardando_coleta',
  'coletado',
  'em_transito',
  'em_entrega',
  'entregue',
  'com_ocorrencia',
  'cancelado',
]

export const validateTrackingEventForm = (values) => {
  const errors = {}

  if (!values.status) {
    errors.status = 'Selecione o status do evento.'
  }

  if (!values.event_at) {
    errors.event_at = 'Informe a data e hora do evento.'
  }

  return errors
}

export default validateTrackingEventForm
