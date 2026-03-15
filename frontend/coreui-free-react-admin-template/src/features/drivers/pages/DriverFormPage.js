import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import DriverForm from '../components/DriverForm'
import driverService from '../services/driverService'
import carrierService from '../../carriers/services/carrierService'
import { validateDriverForm } from '../utils/driverValidation'

const initialValues = {
  transporter_id: '',
  nome: '',
  cpf: '',
  cnh: '',
  categoria_cnh: '',
  validade_cnh: '',
  telefone: '',
  email: '',
  observacoes: '',
  status: 'active',
}

const DriverFormPage = () => {
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
          const data = await driverService.findById(id)
          setValues({
            ...initialValues,
            ...data,
            transporter_id: data.transporter_id ? String(data.transporter_id) : '',
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
    const validationErrors = validateDriverForm(values)
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
        await driverService.update(id, payload)
        setFeedback('Motorista atualizado com sucesso.')
      } else {
        await driverService.create(payload)
        navigate('/registry/drivers', {
          replace: true,
          state: { feedback: 'Motorista criado com sucesso.' },
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
        title={isEdit ? 'Editar motorista' : 'Novo motorista'}
        description="Formulario padrao do CRUD reutilizavel para motoristas."
        createPath="/registry/drivers"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3">
        <CButton color="secondary" variant="outline" as={Link} to="/registry/drivers">
          Voltar
        </CButton>
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      {isLoading ? (
        <CAlert color="info">Carregando dados do motorista...</CAlert>
      ) : (
        <DriverForm
          values={values}
          errors={errors}
          carriers={carriers}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar motorista'}
        />
      )}
    </>
  )
}

export default DriverFormPage
