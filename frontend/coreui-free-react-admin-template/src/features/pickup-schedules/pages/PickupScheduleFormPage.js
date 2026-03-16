import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import PickupScheduleForm from '../components/PickupScheduleForm'
import pickupScheduleService from '../services/pickupScheduleService'
import { validatePickupScheduleForm } from '../utils/pickupScheduleValidation'

const initialValues = {
  transport_document_id: '',
  transporter_id: '',
  unidade_origem: '',
  doca: '',
  data_agendada: '',
  hora_inicio: '',
  hora_fim: '',
  janela_atendimento: '',
  responsavel_agendamento: '',
  observacoes: '',
  status: 'agendado',
}

const PickupScheduleFormPage = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isEdit = Boolean(id)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [options, setOptions] = useState({
    transporters: [],
    transport_documents: [],
    statusOptions: [],
    unitOptions: [],
    dockOptions: [],
  })
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [loadedOptions, schedule] = await Promise.all([
          pickupScheduleService.options(),
          isEdit ? pickupScheduleService.findById(id) : Promise.resolve(null),
        ])

        const normalizedOptions = {
          transporters: loadedOptions.transporters || [],
          transport_documents: loadedOptions.transport_documents || [],
          statusOptions: loadedOptions.statusOptions || [],
          unitOptions: loadedOptions.unitOptions || [],
          dockOptions: loadedOptions.dockOptions || [],
        }

        setOptions(normalizedOptions)

        if (schedule) {
          setValues({
            ...initialValues,
            ...schedule,
            transport_document_id: schedule.transport_document_id ? String(schedule.transport_document_id) : '',
            transporter_id: schedule.transporter_id ? String(schedule.transporter_id) : '',
          })
        } else {
          const transportDocumentId = searchParams.get('transport_document_id') || ''
          const selectedTransportDocument = normalizedOptions.transport_documents.find(
            (item) => String(item.id) === String(transportDocumentId),
          )

          setValues((current) => ({
            ...current,
            transport_document_id: transportDocumentId,
            transporter_id: selectedTransportDocument?.transporter_id
              ? String(selectedTransportDocument.transporter_id)
              : current.transporter_id,
          }))
        }
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    bootstrap()
  }, [dispatch, id, isEdit, searchParams])

  const handleChange = (event) => {
    const { name, value } = event.target

    setValues((current) => {
      const nextValues = { ...current, [name]: value }

      if (name === 'transport_document_id') {
        const selectedTransportDocument = (options.transport_documents || []).find(
          (item) => String(item.id) === String(value),
        )
        nextValues.transporter_id = selectedTransportDocument?.transporter_id
          ? String(selectedTransportDocument.transporter_id)
          : current.transporter_id
      }

      return nextValues
    })

    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validatePickupScheduleForm(values)
    setErrors(validationErrors)
    setFeedback('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isEdit) {
        await pickupScheduleService.update(id, values)
        setFeedback('Agendamento atualizado com sucesso.')
      } else {
        await pickupScheduleService.create(values)
        navigate('/execution/pickup-schedules', {
          replace: true,
          state: { feedback: 'Agendamento criado com sucesso.' },
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
        title={isEdit ? 'Editar agendamento de coleta' : 'Novo agendamento de coleta'}
        description="Registre a janela operacional da coleta e mantenha o fluxo preparado para o check-in do veiculo."
        createPath="/execution/pickup-schedules"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3 d-flex gap-2">
        <CButton color="secondary" variant="outline" as={Link} to="/execution/pickup-schedules">
          Voltar
        </CButton>
        {isEdit ? (
          <CButton color="info" variant="outline" as={Link} to={`/execution/pickup-schedules/${id}`}>
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
        <CAlert color="info">Carregando estrutura do agendamento...</CAlert>
      ) : (
        <PickupScheduleForm
          values={values}
          errors={errors}
          options={options}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar agendamento'}
        />
      )}
    </>
  )
}

export default PickupScheduleFormPage
