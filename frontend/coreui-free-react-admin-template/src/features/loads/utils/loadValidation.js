export const loadStatuses = [
  'planejada',
  'em_montagem',
  'pronta',
  'em_transporte',
  'entregue',
  'cancelada',
]

export const validateLoadForm = (values) => {
  const errors = {}

  if (!values.origem_nome?.trim()) {
    errors.origem_nome = 'Informe o nome da origem.'
  }

  if (!values.origem_cidade?.trim()) {
    errors.origem_cidade = 'Informe a cidade de origem.'
  }

  if (!values.origem_estado?.trim()) {
    errors.origem_estado = 'Informe a UF de origem.'
  } else if (values.origem_estado.trim().length !== 2) {
    errors.origem_estado = 'A UF deve conter 2 caracteres.'
  }

  if (!values.destino_nome?.trim()) {
    errors.destino_nome = 'Informe o nome do destino.'
  }

  if (!values.destino_cidade?.trim()) {
    errors.destino_cidade = 'Informe a cidade de destino.'
  }

  if (!values.destino_estado?.trim()) {
    errors.destino_estado = 'Informe a UF de destino.'
  } else if (values.destino_estado.trim().length !== 2) {
    errors.destino_estado = 'A UF deve conter 2 caracteres.'
  }

  if (!values.data_prevista_saida) {
    errors.data_prevista_saida = 'Informe a data prevista de saida.'
  }

  if (!values.data_prevista_entrega) {
    errors.data_prevista_entrega = 'Informe a data prevista de entrega.'
  }

  if (
    values.data_prevista_saida &&
    values.data_prevista_entrega &&
    values.data_prevista_entrega < values.data_prevista_saida
  ) {
    errors.data_prevista_entrega = 'A entrega nao pode ser anterior a saida.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status da carga.'
  }

  return errors
}

export default validateLoadForm
