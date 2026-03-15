import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import carrierService from '../../carriers/services/carrierService'
import vehicleService from '../services/vehicleService'
import VehicleForm from '../components/VehicleForm'
import { validateVehicleForm } from '../utils/vehicleValidation'

const initialValues = {
  transporter_id: '',
  placa: '',
  renavam: '',
  tipo_veiculo: '',
  tipo_carroceria: '',
  capacidade_peso: '',
  capacidade_volume: '',
  ano_modelo: '',
  status: 'active',
  observacoes: '',
}

const VehicleFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isEdit = Boolean(id)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [carriers, setCarriers] = useState([])
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const carrierResponse = await carrierService.list({ page: 1, perPage: 100, status: '' })
        setCarriers(carrierResponse.items || [])

        if (isEdit) {
          const data = await vehicleService.findById(id)
          setValues({
            ...initialValues,
            ...data,
            transporter_id: data.transporter_id ? String(data.transporter_id) : '',
            capacidade_peso: data.capacidade_peso ?? '',
            capacidade_volume: data.capacidade_volume ?? '',
            ano_modelo: data.ano_modelo ?? '',
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
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateVehicleForm(values)
    setErrors(validationErrors)
    setFeedback('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        ...values,
        transporter_id: Number(values.transporter_id),
      }

      if (isEdit) {
        await vehicleService.update(id, payload)
        setFeedback('Veiculo atualizado com sucesso.')
      } else {
        await vehicleService.create(payload)
        navigate('/registry/vehicles', {
          replace: true,
          state: { feedback: 'Veiculo criado com sucesso.' },
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
        title={isEdit ? 'Editar veiculo' : 'Novo veiculo'}
        description="Formulario padrao do CRUD reutilizavel para veiculos."
        createPath="/registry/vehicles"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3">
        <CButton color="secondary" variant="outline" as={Link} to="/registry/vehicles">
          Voltar
        </CButton>
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      {isLoading ? (
        <CAlert color="info">Carregando dados do veiculo...</CAlert>
      ) : (
        <VehicleForm
          values={values}
          errors={errors}
          carriers={carriers}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar veiculo'}
        />
      )}
    </>
  )
}

export default VehicleFormPage
