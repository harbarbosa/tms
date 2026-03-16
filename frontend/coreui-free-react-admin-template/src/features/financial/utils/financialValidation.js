export const validateFinancialForm = (values) => {
  const errors = {}

  if (!values.freight_audit_id) {
    errors.freight_audit_id = 'Selecione a auditoria.'
  }

  if (!values.transport_document_id) {
    errors.transport_document_id = 'Selecione a ordem de transporte.'
  }

  if (!values.transporter_id) {
    errors.transporter_id = 'Selecione a transportadora.'
  }

  if (!values.valor_previsto) {
    errors.valor_previsto = 'Informe o valor previsto.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status.'
  }

  return errors
}

export default validateFinancialForm
