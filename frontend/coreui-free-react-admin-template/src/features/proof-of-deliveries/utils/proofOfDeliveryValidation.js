export const validateProofOfDeliveryForm = (values, isEdit = false) => {
  const errors = {}

  if (!values.ordem_transporte_id) {
    errors.ordem_transporte_id = 'Selecione a ordem de transporte.'
  }

  if (!values.data_entrega_real) {
    errors.data_entrega_real = 'Informe a data e hora reais da entrega.'
  }

  if (!values.nome_recebedor?.trim()) {
    errors.nome_recebedor = 'Informe o nome do recebedor.'
  }

  if (!values.arquivo_comprovante && !isEdit) {
    errors.arquivo_comprovante = 'Selecione o arquivo do comprovante.'
  }

  return errors
}

export default validateProofOfDeliveryForm
