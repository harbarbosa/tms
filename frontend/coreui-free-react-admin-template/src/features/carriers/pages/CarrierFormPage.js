import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CarrierForm from '../components/CarrierForm'
import carrierService from '../services/carrierService'
import { validateCarrierForm } from '../utils/carrierValidation'

const initialValues = {
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
  antt: '',
  email: '',
  telefone: '',
  cep: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  status: 'active',
}

const CarrierFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isEdit = Boolean(id)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) {
      return
    }

    const loadCarrier = async () => {
      try {
        const data = await carrierService.findById(id)
        setValues({
          ...initialValues,
          ...data,
        })
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    loadCarrier()
  }, [dispatch, id, isEdit])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateCarrierForm(values)
    setErrors(validationErrors)
    setFeedback('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isEdit) {
        await carrierService.update(id, values)
        setFeedback('Transportadora atualizada com sucesso.')
      } else {
        await carrierService.create(values)
        navigate('/registry/carriers', {
          replace: true,
          state: { feedback: 'Transportadora criada com sucesso.' },
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
        title={isEdit ? 'Editar transportadora' : 'Nova transportadora'}
        description="Formulario padrao do CRUD reutilizavel para cadastros do TMS."
        createPath="/registry/carriers"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3">
        <CButton color="secondary" variant="outline" as={Link} to="/registry/carriers">
          Voltar
        </CButton>
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      {isLoading ? (
        <CAlert color="info">Carregando dados da transportadora...</CAlert>
      ) : (
        <CarrierForm
          values={values}
          errors={errors}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar transportadora'}
        />
      )}
    </>
  )
}

export default CarrierFormPage
