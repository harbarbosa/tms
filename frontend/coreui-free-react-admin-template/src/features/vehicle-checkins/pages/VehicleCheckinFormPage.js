import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import VehicleCheckinForm from '../components/VehicleCheckinForm'
import vehicleCheckinService from '../services/vehicleCheckinService'
import { validateVehicleCheckinForm } from '../utils/vehicleCheckinValidation'

const toLocalDateTime = (value) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const pad = (input) => String(input).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const toApiDateTime = (value) => (value ? `${value.replace('T', ' ')}:00` : '')

const initialValues = {
  transport_document_id: '',
  pickup_schedule_id: '',
  transporter_id: '',
  driver_id: '',
  vehicle_id: '',
  placa: '',
  doca: '',
  horario_chegada: '',
  horario_entrada: '',
  horario_saida: '',
  status: 'aguardando',
  observacoes: '',
  divergencia: false,
}

const VehicleCheckinFormPage = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isEdit = Boolean(id)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [options, setOptions] = useState({
    transporters: [],
    drivers: [],
    vehicles: [],
    pickup_schedules: [],
    transport_documents: [],
    statusOptions: [],
    dockOptions: [],
  })
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [loadedOptions, checkin] = await Promise.all([
          vehicleCheckinService.options(),
          isEdit ? vehicleCheckinService.findById(id) : Promise.resolve(null),
        ])

        const normalizedOptions = {
          transporters: loadedOptions.transporters || [],
          drivers: loadedOptions.drivers || [],
          vehicles: loadedOptions.vehicles || [],
          pickup_schedules: loadedOptions.pickup_schedules || [],
          transport_documents: loadedOptions.transport_documents || [],
          statusOptions: loadedOptions.statusOptions || [],
          dockOptions: loadedOptions.dockOptions || [],
        }

        setOptions(normalizedOptions)

        if (checkin) {
          setValues({
            ...initialValues,
            ...checkin,
            transport_document_id: checkin.transport_document_id ? String(checkin.transport_document_id) : '',
            pickup_schedule_id: checkin.pickup_schedule_id ? String(checkin.pickup_schedule_id) : '',
            transporter_id: checkin.transporter_id ? String(checkin.transporter_id) : '',
            driver_id: checkin.driver_id ? String(checkin.driver_id) : '',
            vehicle_id: checkin.vehicle_id ? String(checkin.vehicle_id) : '',
            horario_chegada: toLocalDateTime(checkin.horario_chegada),
            horario_entrada: toLocalDateTime(checkin.horario_entrada),
            horario_saida: toLocalDateTime(checkin.horario_saida),
            divergencia: Boolean(checkin.divergencia),
          })
        } else {
          const pickupScheduleId = searchParams.get('pickup_schedule_id') || ''
          const transportDocumentId = searchParams.get('transport_document_id') || ''
          const selectedSchedule = normalizedOptions.pickup_schedules.find((item) => String(item.id) === String(pickupScheduleId))
          const selectedDocument = normalizedOptions.transport_documents.find(
            (item) => String(item.id) === String(transportDocumentId || selectedSchedule?.transport_document_id || ''),
          )

          setValues((current) => ({
            ...current,
            pickup_schedule_id: pickupScheduleId,
            transport_document_id: transportDocumentId || (selectedSchedule?.transport_document_id ? String(selectedSchedule.transport_document_id) : ''),
            transporter_id: selectedSchedule?.transporter_id
              ? String(selectedSchedule.transporter_id)
              : selectedDocument?.transporter_id
                ? String(selectedDocument.transporter_id)
                : current.transporter_id,
            doca: selectedSchedule?.doca || current.doca,
            horario_chegada: current.horario_chegada || toLocalDateTime(new Date().toISOString()),
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
    const { name, value, type, checked } = event.target
    const normalizedValue = type === 'checkbox' ? checked : value

    setValues((current) => {
      const nextValues = { ...current, [name]: normalizedValue }

      if (name === 'pickup_schedule_id') {
        const selectedSchedule = (options.pickup_schedules || []).find((item) => String(item.id) === String(value))
        nextValues.transport_document_id = selectedSchedule?.transport_document_id
          ? String(selectedSchedule.transport_document_id)
          : current.transport_document_id
        nextValues.transporter_id = selectedSchedule?.transporter_id
          ? String(selectedSchedule.transporter_id)
          : current.transporter_id
        nextValues.doca = selectedSchedule?.doca || current.doca
      }

      if (name === 'transport_document_id') {
        const selectedDocument = (options.transport_documents || []).find((item) => String(item.id) === String(value))
        nextValues.transporter_id = selectedDocument?.transporter_id
          ? String(selectedDocument.transporter_id)
          : current.transporter_id
      }

      if (name === 'vehicle_id') {
        const selectedVehicle = (options.vehicles || []).find((item) => String(item.id) === String(value))
        nextValues.placa = selectedVehicle?.placa || current.placa
      }

      return nextValues
    })

    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateVehicleCheckinForm(values)
    setErrors(validationErrors)
    setFeedback('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const payload = {
      ...values,
      horario_chegada: toApiDateTime(values.horario_chegada),
      horario_entrada: toApiDateTime(values.horario_entrada),
      horario_saida: toApiDateTime(values.horario_saida),
    }

    setIsSubmitting(true)

    try {
      if (isEdit) {
        await vehicleCheckinService.update(id, payload)
        setFeedback('Check-in atualizado com sucesso.')
      } else {
        await vehicleCheckinService.create(payload)
        navigate('/execution/vehicle-checkins', {
          replace: true,
          state: { feedback: 'Check-in criado com sucesso.' },
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
        title={isEdit ? 'Editar check-in de veiculo' : 'Novo check-in de veiculo'}
        description="Registre a chegada no gate e prepare o acompanhamento de entrada, carregamento e saida."
        createPath="/execution/vehicle-checkins"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3 d-flex gap-2">
        <CButton color="secondary" variant="outline" as={Link} to="/execution/vehicle-checkins">
          Voltar
        </CButton>
        {isEdit ? (
          <CButton color="info" variant="outline" as={Link} to={`/execution/vehicle-checkins/${id}`}>
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
        <CAlert color="info">Carregando estrutura do check-in...</CAlert>
      ) : (
        <VehicleCheckinForm
          values={values}
          errors={errors}
          options={options}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar check-in'}
        />
      )}
    </>
  )
}

export default VehicleCheckinFormPage
