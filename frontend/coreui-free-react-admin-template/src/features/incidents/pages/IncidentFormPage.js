import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import incidentService from '../services/incidentService'
import IncidentForm from '../components/IncidentForm'
import { validateIncidentForm } from '../utils/incidentValidation'

const initialValues = {
  transport_document_id: '',
  tipo_ocorrencia: '',
  status: 'aberta',
  occurred_at: '',
  observacoes: '',
  attachment_path: '',
}

const toLocalDateTime = (value) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const pad = (input) => String(input).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const toApiDateTime = (value) => (value ? `${value.replace('T', ' ')}:00` : '')

const IncidentFormPage = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isEdit = Boolean(id)
  const preselectedTransportDocumentId = new URLSearchParams(location.search).get('transport_document_id') || ''
  const [values, setValues] = useState({
    ...initialValues,
    transport_document_id: preselectedTransportDocumentId,
  })
  const [errors, setErrors] = useState({})
  const [options, setOptions] = useState({ transport_documents: [], typeOptions: [], statusOptions: [] })
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [loadedOptions, incident] = await Promise.all([
          incidentService.options(),
          isEdit ? incidentService.findById(id) : Promise.resolve(null),
        ])

        setOptions({
          transport_documents: loadedOptions.transport_documents || [],
          typeOptions: loadedOptions.typeOptions || [],
          statusOptions: loadedOptions.statusOptions || [],
        })

        if (incident) {
          setValues({
            ...initialValues,
            ...incident,
            transport_document_id: incident.transport_document_id ? String(incident.transport_document_id) : '',
            occurred_at: toLocalDateTime(incident.occurred_at),
          })
        } else {
          setValues((current) => ({
            ...current,
            occurred_at: current.occurred_at || toLocalDateTime(new Date().toISOString()),
          }))
        }
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    bootstrap()
  }, [dispatch, id, isEdit, preselectedTransportDocumentId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = {
      ...values,
      occurred_at: toApiDateTime(values.occurred_at),
    }
    const validationErrors = validateIncidentForm(payload)
    setErrors(validationErrors)
    setFeedback('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isEdit) {
        await incidentService.update(id, payload)
        setFeedback('Ocorrencia atualizada com sucesso.')
      } else {
        await incidentService.create(payload)
        navigate('/execution/incidents', {
          replace: true,
          state: { feedback: 'Ocorrencia criada com sucesso.' },
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
        title={isEdit ? 'Editar ocorrencia' : 'Nova ocorrencia'}
        description="Registre desvios operacionais com contexto da viagem e estrutura preparada para evidencias futuras."
        createPath="/execution/incidents"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3 d-flex gap-2">
        <CButton color="secondary" variant="outline" as={Link} to="/execution/incidents">
          Voltar
        </CButton>
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      {isLoading ? (
        <CAlert color="info">Carregando estrutura da ocorrencia...</CAlert>
      ) : (
        <IncidentForm
          values={values}
          errors={errors}
          options={options}
          isSubmitting={isSubmitting}
          onChange={(event) => {
            const { name, value } = event.target
            setValues((current) => ({ ...current, [name]: value }))
            setErrors((current) => ({ ...current, [name]: undefined }))
          }}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar ocorrencia'}
        />
      )}
    </>
  )
}

export default IncidentFormPage
