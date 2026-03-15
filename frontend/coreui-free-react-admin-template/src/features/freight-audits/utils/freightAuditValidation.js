export const freightAuditStatuses = ['pendente', 'aprovado', 'divergente', 'recusado']

export const validateFreightAuditForm = (values) => {
  const errors = {}

  if (!values.ordem_transporte_id) {
    errors.ordem_transporte_id = 'Selecione a ordem de transporte.'
  }

  if (!values.valor_contratado && values.valor_contratado !== 0) {
    errors.valor_contratado = 'Informe o valor contratado.'
  }

  if (!values.valor_cobrado && values.valor_cobrado !== 0) {
    errors.valor_cobrado = 'Informe o valor cobrado.'
  }

  if (!values.status_auditoria) {
    errors.status_auditoria = 'Selecione o status da auditoria.'
  }

  if (!values.data_auditoria) {
    errors.data_auditoria = 'Informe a data da auditoria.'
  }

  return errors
}

export default validateFreightAuditForm
