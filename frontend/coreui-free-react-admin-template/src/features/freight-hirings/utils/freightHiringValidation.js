export const validateFreightHiringForm = (values) => {
  const errors = {}

  if (!values.freight_quotation_id) {
    errors.freight_quotation_id = 'Selecione a cotacao aprovada.'
  }

  if (!values.freight_quotation_proposal_id) {
    errors.freight_quotation_proposal_id = 'Selecione a proposta aprovada.'
  }

  if (!values.transporter_id) {
    errors.transporter_id = 'Selecione a transportadora.'
  }

  if (!values.tipo_referencia) {
    errors.tipo_referencia = 'Selecione o tipo da referencia.'
  }

  if (!values.referencia_id) {
    errors.referencia_id = 'Selecione a referencia.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status.'
  }

  if (!values.data_contratacao) {
    errors.data_contratacao = 'Informe a data da contratacao.'
  }

  return errors
}

export default validateFreightHiringForm
