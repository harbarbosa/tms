export const incidentTypes = ['atraso', 'avaria', 'recusa', 'devolucao', 'extravio', 'problema_operacional']

export const incidentStatuses = ['aberta', 'em_tratativa', 'resolvida', 'cancelada']

export const validateIncidentForm = (values) => {
  const errors = {}

  if (!values.transport_document_id) {
    errors.transport_document_id = 'Selecione a ordem de transporte.'
  }

  if (!values.tipo_ocorrencia) {
    errors.tipo_ocorrencia = 'Selecione o tipo de ocorrencia.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status da ocorrencia.'
  }

  if (!values.occurred_at) {
    errors.occurred_at = 'Informe a data e hora da ocorrencia.'
  }

  return errors
}

export default validateIncidentForm
