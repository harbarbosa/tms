import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import TransportDocumentForm from '../components/TransportDocumentForm'
import transportDocumentService from '../services/transportDocumentService'
import { validateTransportDocumentForm } from '../utils/transportDocumentValidation'

const initialValues = {
  carga_id: '',
  pedido_id: '',
  transporter_id: '',
  driver_id: '',
  vehicle_id: '',
  data_coleta_prevista: '',
  data_entrega_prevista: '',
  valor_frete_contratado: '',
  status: 'rascunho',
  observacoes: '',
}

const emptyOptions = {
  transporters: [],
  drivers: [],
  vehicles: [],
  loads: [],
  transport_orders: [],
}

const TransportDocumentFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isEdit = Boolean(id)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [options, setOptions] = useState(emptyOptions)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [loadedOptions, document] = await Promise.all([
          transportDocumentService.options(),
          isEdit ? transportDocumentService.findById(id) : Promise.resolve(null),
        ])

        setOptions({
          transporters: loadedOptions.transporters || [],
          drivers: loadedOptions.drivers || [],
          vehicles: loadedOptions.vehicles || [],
          loads: loadedOptions.loads || [],
          transport_orders: loadedOptions.transport_orders || [],
        })

        if (document) {
          setValues({
            ...initialValues,
            ...document,
            carga_id: document.carga_id ? String(document.carga_id) : '',
            pedido_id: document.pedido_id ? String(document.pedido_id) : '',
            transporter_id: document.transporter_id ? String(document.transporter_id) : '',
            driver_id: document.driver_id ? String(document.driver_id) : '',
            vehicle_id: document.vehicle_id ? String(document.vehicle_id) : '',
            valor_frete_contratado: document.valor_frete_contratado ?? '',
          })
        }
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    bootstrap()
  }, [dispatch, id, isEdit])

  const handleChange = (event) => {
    const { name, value } = event.target

    setValues((current) => ({
      ...current,
      [name]: value,
      ...(name === 'transporter_id' ? { driver_id: '', vehicle_id: '' } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined, referencia: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateTransportDocumentForm(values)
    setErrors(validationErrors)
    setFeedback('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isEdit) {
        await transportDocumentService.update(id, values)
        setFeedback('Ordem de transporte atualizada com sucesso.')
      } else {
        await transportDocumentService.create(values)
        navigate('/operations/transport-documents', {
          replace: true,
          state: { feedback: 'Ordem de transporte criada com sucesso.' },
        })
        return
      }
    } catch (error) {
      if (error.data?.errors) {
        setErrors(error.data.errors)
      }
      dispatch({ type: 'app/setError', payload: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <CrudPageHeader
        title={isEdit ? 'Editar ordem de transporte' : 'Nova ordem de transporte'}
        description="Registre o documento operacional que conecta referencia, transportadora, motorista e veiculo."
        createPath="/operations/transport-documents"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3 d-flex gap-2">
        <CButton color="secondary" variant="outline" as={Link} to="/operations/transport-documents">
          Voltar
        </CButton>
        {isEdit ? (
          <CButton color="info" variant="outline" as={Link} to={`/operations/transport-documents/${id}`}>
            Ver detalhes
          </CButton>
        ) : null}
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      {isLoading ? (
        <CAlert color="info">Carregando estrutura da OT...</CAlert>
      ) : (
        <TransportDocumentForm
          values={values}
          errors={errors}
          options={options}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar OT'}
        />
      )}
    </>
  )
}

export default TransportDocumentFormPage
