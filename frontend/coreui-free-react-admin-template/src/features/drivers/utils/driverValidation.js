const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const onlyDigits = (value) => value.replace(/\D/g, '')

export const isValidCpf = (value) => {
  const cpf = onlyDigits(value || '')

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  const calculateDigit = (base, factor) => {
    const total = base.split('').reduce((sum, digit) => {
      const result = sum + Number(digit) * factor
      factor -= 1
      return result
    }, 0)

    const remainder = (total * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  const firstDigit = calculateDigit(cpf.slice(0, 9), 10)
  const secondDigit = calculateDigit(cpf.slice(0, 10), 11)

  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10])
}

export const validateDriverForm = (values) => {
  const errors = {}

  if (!values.transporter_id) {
    errors.transporter_id = 'Selecione a transportadora.'
  }

  if (!values.nome?.trim()) {
    errors.nome = 'Informe o nome do motorista.'
  }

  if (!values.cpf?.trim()) {
    errors.cpf = 'Informe o CPF.'
  } else if (!isValidCpf(values.cpf)) {
    errors.cpf = 'Informe um CPF valido.'
  }

  if (!values.cnh?.trim()) {
    errors.cnh = 'Informe a CNH.'
  }

  if (!values.categoria_cnh?.trim()) {
    errors.categoria_cnh = 'Informe a categoria da CNH.'
  }

  if (!values.validade_cnh) {
    errors.validade_cnh = 'Informe a validade da CNH.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status.'
  }

  if (values.email && !emailRegex.test(values.email)) {
    errors.email = 'Informe um e-mail valido.'
  }

  return errors
}

export default validateDriverForm
