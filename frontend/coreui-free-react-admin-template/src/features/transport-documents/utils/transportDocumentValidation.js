export const transportDocumentStatuses = [
  'rascunho',
  'programada',
  'em_coleta',
  'em_transito',
  'entregue',
  'finalizada',
  'cancelada',
]

export const validateTransportDocumentForm = (values) => {
  const errors = {}

  if (!values.carga_id && !values.pedido_id) {
    errors.referencia = 'Informe ao menos uma carga ou um pedido.'
  }

  if (!values.transporter_id) {
    errors.transporter_id = 'Selecione a transportadora.'
  }

  if (!values.data_coleta_prevista) {
    errors.data_coleta_prevista = 'Informe a data prevista de coleta.'
  }

  if (!values.data_entrega_prevista) {
    errors.data_entrega_prevista = 'Informe a data prevista de entrega.'
  } else if (
    values.data_coleta_prevista &&
    values.data_entrega_prevista < values.data_coleta_prevista
  ) {
    errors.data_entrega_prevista = 'A entrega prevista deve ser posterior ou igual a coleta.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status da OT.'
  }

  if (values.valor_frete_contratado && Number(values.valor_frete_contratado) < 0) {
    errors.valor_frete_contratado = 'Informe um valor valido.'
  }

  return errors
}

export default validateTransportDocumentForm
