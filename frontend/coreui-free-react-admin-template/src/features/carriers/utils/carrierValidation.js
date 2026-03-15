const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const onlyDigits = (value) => value.replace(/\D/g, '')

export const isValidCnpj = (value) => {
  const cnpj = onlyDigits(value || '')

  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false
  }

  const calculateDigit = (base, factors) => {
    const total = factors.reduce((sum, factor, index) => sum + Number(base[index]) * factor, 0)
    const remainder = total % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  const firstDigit = calculateDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const secondDigit = calculateDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])

  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13])
}

export const validateCarrierForm = (values) => {
  const errors = {}

  if (!values.razao_social?.trim()) {
    errors.razao_social = 'Informe a razao social.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status.'
  }

  if (values.email && !emailRegex.test(values.email)) {
    errors.email = 'Informe um e-mail valido.'
  }

  if (values.cnpj && !isValidCnpj(values.cnpj)) {
    errors.cnpj = 'Informe um CNPJ valido.'
  }

  return errors
}

export default validateCarrierForm
