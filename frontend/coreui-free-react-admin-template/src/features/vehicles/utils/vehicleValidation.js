const normalizePlate = (value) => (value || '').toUpperCase().replace(/[^A-Z0-9]/g, '')

export const isValidVehiclePlate = (value) => {
  const plate = normalizePlate(value)
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate)
}

export const vehicleTypes = ['CAVALO', 'TRUCK', 'TOCO', 'VUC', 'BITREM', 'CARRETA']

export const bodyTypes = ['BAU', 'SIDER', 'GRANELEIRO', 'TANQUE', 'PORTA_CONTAINER']

export const validateVehicleForm = (values) => {
  const errors = {}

  if (!values.transporter_id) {
    errors.transporter_id = 'Selecione a transportadora.'
  }

  if (!values.placa?.trim()) {
    errors.placa = 'Informe a placa.'
  } else if (!isValidVehiclePlate(values.placa)) {
    errors.placa = 'Informe uma placa valida.'
  }

  if (!values.tipo_veiculo?.trim()) {
    errors.tipo_veiculo = 'Informe o tipo do veiculo.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status.'
  }

  return errors
}

export default validateVehicleForm
