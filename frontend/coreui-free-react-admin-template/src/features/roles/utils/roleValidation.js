export const validateRoleForm = (values) => {
  const errors = {}

  if (!values.name?.trim()) {
    errors.name = 'Informe o nome do perfil.'
  }

  if (!values.scope) {
    errors.scope = 'Selecione o escopo do perfil.'
  }

  if (!values.status) {
    errors.status = 'Selecione o status.'
  }

  return errors
}

export default validateRoleForm
