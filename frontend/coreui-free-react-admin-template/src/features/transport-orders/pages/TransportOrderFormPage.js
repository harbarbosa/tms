import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import TransportOrderForm from '../components/TransportOrderForm'
import transportOrderService from '../services/transportOrderService'
import { validateTransportOrderForm } from '../utils/transportOrderValidation'

const initialValues = {
  cliente_nome: '',
  documento_cliente: '',
  cep_entrega: '',
  endereco_entrega: '',
  numero_entrega: '',
  bairro_entrega: '',
  cidade_entrega: '',
  estado_entrega: '',
  data_prevista_entrega: '',
  peso_total: '',
  volume_total: '',
  valor_mercadoria: '',
  observacoes: '',
  status: 'pendente',
}

const TransportOrderFormPage = () => {
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

    const loadOrder = async () => {
      try {
        const data = await transportOrderService.findById(id)
        setValues({
          ...initialValues,
          ...data,
          peso_total: data.peso_total ?? '',
          volume_total: data.volume_total ?? '',
          valor_mercadoria: data.valor_mercadoria ?? '',
        })
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [dispatch, id, isEdit])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateTransportOrderForm(values)
    setErrors(validationErrors)
    setFeedback('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isEdit) {
        await transportOrderService.update(id, values)
        setFeedback('Pedido de transporte atualizado com sucesso.')
      } else {
        await transportOrderService.create(values)
        navigate('/operations/transport-orders', {
          replace: true,
          state: { feedback: 'Pedido de transporte criado com sucesso.' },
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
        title={isEdit ? 'Editar pedido de transporte' : 'Novo pedido de transporte'}
        description="Formulario base para capturar solicitacoes de transporte antes da composicao de cargas."
        createPath="/operations/transport-orders"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3">
        <CButton color="secondary" variant="outline" as={Link} to="/operations/transport-orders">
          Voltar
        </CButton>
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      {isLoading ? (
        <CAlert color="info">Carregando dados do pedido...</CAlert>
      ) : (
        <TransportOrderForm
          values={values}
          errors={errors}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar pedido'}
        />
      )}
    </>
  )
}

export default TransportOrderFormPage
