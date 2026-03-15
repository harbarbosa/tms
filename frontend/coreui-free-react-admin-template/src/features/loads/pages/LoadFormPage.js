import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import LoadForm from '../components/LoadForm'
import loadService from '../services/loadService'
import { validateLoadForm } from '../utils/loadValidation'

const initialValues = {
  origem_nome: '',
  origem_cidade: '',
  origem_estado: '',
  destino_nome: '',
  destino_cidade: '',
  destino_estado: '',
  data_prevista_saida: '',
  data_prevista_entrega: '',
  peso_total: '',
  volume_total: '',
  valor_total: '',
  observacoes: '',
  status: 'planejada',
}

const LoadFormPage = () => {
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

    const fetchLoad = async () => {
      try {
        const data = await loadService.findById(id)
        setValues({
          ...initialValues,
          ...data,
          peso_total: data.peso_total ?? '',
          volume_total: data.volume_total ?? '',
          valor_total: data.valor_total ?? '',
        })
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoad()
  }, [dispatch, id, isEdit])

  const handleChange = (event) => {
    const { name, value } = event.target
    const normalizedValue = ['origem_estado', 'destino_estado'].includes(name) ? value.toUpperCase() : value

    setValues((current) => ({ ...current, [name]: normalizedValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateLoadForm(values)
    setErrors(validationErrors)
    setFeedback('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isEdit) {
        await loadService.update(id, values)
        setFeedback('Carga atualizada com sucesso.')
      } else {
        await loadService.create(values)
        navigate('/operations/loads', {
          replace: true,
          state: { feedback: 'Carga criada com sucesso.' },
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
        title={isEdit ? 'Editar carga' : 'Nova carga'}
        description="Planeje a composicao da carga e prepare a vinculacao de pedidos no fluxo operacional."
        createPath="/operations/loads"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3 d-flex gap-2">
        <CButton color="secondary" variant="outline" as={Link} to="/operations/loads">
          Voltar
        </CButton>
        {isEdit ? (
          <CButton color="info" variant="outline" as={Link} to={`/operations/loads/${id}`}>
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
        <CAlert color="info">Carregando dados da carga...</CAlert>
      ) : (
        <LoadForm
          values={values}
          errors={errors}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar carga'}
        />
      )}
    </>
  )
}

export default LoadFormPage
