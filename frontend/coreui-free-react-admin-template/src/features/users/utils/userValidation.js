const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateUserForm = (values, isEdit = false) => {
  const errors = {}

  if (!values.name?.trim()) {
    errors.name = 'Informe o nome do usuario.'
  }

  if (!values.email?.trim()) {
    errors.email = 'Informe o e-mail do usuario.'
  } else if (!emailRegex.test(values.email)) {
    errors.email = 'Informe um e-mail valido.'
  }

  if (!isEdit && !values.password?.trim()) {
    errors.password = 'Informe a senha inicial do usuario.'
  }

  if (values.password && values.password.length < 6) {
    errors.password = 'A senha deve ter ao menos 6 caracteres.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status.'
  }

  if (!values.primary_company_id) {
    errors.primary_company_id = 'Selecione a empresa principal.'
  }

  if (!values.primary_role_id) {
    errors.primary_role_id = 'Selecione o perfil principal.'
  }

  if (!values.company_ids?.length) {
    errors.company_ids = 'Selecione ao menos uma empresa.'
  }

  if (!values.role_ids?.length) {
    errors.role_ids = 'Selecione ao menos um perfil.'
  }

  return errors
}

export default validateUserForm
