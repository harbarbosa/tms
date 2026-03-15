export const transportOrderStatuses = [
  'pendente',
  'em_planejamento',
  'cotacao',
  'contratado',
  'em_transporte',
  'entregue',
  'cancelado',
]

export const validateTransportOrderForm = (values) => {
  const errors = {}

  if (!values.cliente_nome?.trim()) {
    errors.cliente_nome = 'Informe o nome do cliente.'
  }

  if (!values.endereco_entrega?.trim()) {
    errors.endereco_entrega = 'Informe o endereco de entrega.'
  }

  if (!values.cidade_entrega?.trim()) {
    errors.cidade_entrega = 'Informe a cidade de entrega.'
  }

  if (!values.estado_entrega?.trim()) {
    errors.estado_entrega = 'Informe o estado de entrega.'
  }

  if (!values.data_prevista_entrega) {
    errors.data_prevista_entrega = 'Informe a data prevista de entrega.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status.'
  }

  return errors
}

export default validateTransportOrderForm
