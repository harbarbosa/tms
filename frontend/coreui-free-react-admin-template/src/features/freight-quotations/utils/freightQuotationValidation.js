export const quotationStatuses = ['rascunho', 'enviada', 'em_analise', 'aprovada', 'cancelada', 'expirada']

export const proposalStatuses = ['pendente', 'respondida', 'recusada', 'aprovada']

export const validateFreightQuotationForm = (values) => {
  const errors = {}

  if (!values.tipo_referencia) {
    errors.tipo_referencia = 'Selecione o tipo de referencia.'
  }

  if (!values.referencia_id) {
    errors.referencia_id = 'Selecione o pedido ou a carga que sera cotada.'
  }

  if (!values.data_envio) {
    errors.data_envio = 'Informe a data de envio.'
  }

  if (!values.data_limite_resposta) {
    errors.data_limite_resposta = 'Informe a data limite de resposta.'
  } else if (values.data_envio && values.data_limite_resposta < values.data_envio) {
    errors.data_limite_resposta = 'A data limite deve ser igual ou posterior a data de envio.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status da cotacao.'
  }

  if (!values.proposals?.length) {
    errors.proposals = 'Adicione ao menos uma proposta para a cotacao.'
  }

  const transporterIds = new Set()

  ;(values.proposals || []).forEach((proposal, index) => {
    if (!proposal.transporter_id) {
      errors[`proposals.${index}.transporter_id`] = 'Selecione a transportadora.'
    } else if (transporterIds.has(String(proposal.transporter_id))) {
      errors[`proposals.${index}.transporter_id`] = 'Nao repita a mesma transportadora.'
    } else {
      transporterIds.add(String(proposal.transporter_id))
    }

    if (proposal.valor_frete && Number(proposal.valor_frete) < 0) {
      errors[`proposals.${index}.valor_frete`] = 'Informe um valor valido.'
    }

    if (proposal.prazo_entrega_dias && Number(proposal.prazo_entrega_dias) < 0) {
      errors[`proposals.${index}.prazo_entrega_dias`] = 'Informe um prazo valido.'
    }

    if (!proposal.status_resposta) {
      errors[`proposals.${index}.status_resposta`] = 'Selecione o status da proposta.'
    }
  })

  return errors
}

export default validateFreightQuotationForm
