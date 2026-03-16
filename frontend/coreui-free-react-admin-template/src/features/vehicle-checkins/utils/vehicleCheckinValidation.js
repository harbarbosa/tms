export const validateVehicleCheckinForm = (values) => {
  const errors = {}

  if (!values.transporter_id) {
    errors.transporter_id = 'Selecione a transportadora.'
  }

  if (!values.transport_document_id && !values.pickup_schedule_id) {
    errors.pickup_schedule_id = 'Informe um agendamento ou uma OT para o check-in.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status.'
  }

  const orderedFields = [
    ['horario_chegada', 'Chegada'],
    ['horario_entrada', 'Entrada'],
    ['horario_saida', 'Saida'],
  ]

  for (let index = 1; index < orderedFields.length; index += 1) {
    const [currentField, currentLabel] = orderedFields[index]
    const [previousField] = orderedFields[index - 1]

    if (values[currentField] && values[previousField] && values[currentField] < values[previousField]) {
      errors[currentField] = `${currentLabel} deve ser posterior ao horario anterior.`
    }
  }

  return errors
}

export default validateVehicleCheckinForm
