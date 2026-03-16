export const validatePickupScheduleForm = (values) => {
  const errors = {}

  if (!values.transporter_id) {
    errors.transporter_id = 'Selecione a transportadora.'
  }

  if (!values.unidade_origem?.trim()) {
    errors.unidade_origem = 'Informe a unidade de origem.'
  }

  if (!values.data_agendada) {
    errors.data_agendada = 'Informe a data agendada.'
  }

  if (!values.hora_inicio) {
    errors.hora_inicio = 'Informe a hora inicial.'
  }

  if (!values.hora_fim) {
    errors.hora_fim = 'Informe a hora final.'
  }

  if (values.hora_inicio && values.hora_fim && values.hora_inicio >= values.hora_fim) {
    errors.hora_fim = 'A hora final deve ser maior que a hora inicial.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status.'
  }

  return errors
}

export default validatePickupScheduleForm
