export const tripDocumentTypes = ['CTe', 'MDFe', 'Nota Fiscal', 'Comprovante de Entrega', 'Outros']

export const validateTripDocumentForm = (values) => {
  const errors = {}

  if (!values.ordem_transporte_id) {
    errors.ordem_transporte_id = 'Selecione a ordem de transporte.'
  }

  if (!values.tipo_documento) {
    errors.tipo_documento = 'Selecione o tipo de documento.'
  }

  if (!values.arquivo) {
    errors.arquivo = 'Selecione um arquivo para upload.'
  }

  return errors
}

export default validateTripDocumentForm
