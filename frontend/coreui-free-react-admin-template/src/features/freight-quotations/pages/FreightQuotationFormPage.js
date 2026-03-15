import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import FreightQuotationForm from '../components/FreightQuotationForm'
import freightQuotationService from '../services/freightQuotationService'
import { validateFreightQuotationForm } from '../utils/freightQuotationValidation'

const emptyProposal = {
  transporter_id: '',
  valor_frete: '',
  prazo_entrega_dias: '',
  observacoes: '',
  status_resposta: 'pendente',
}

const initialValues = {
  tipo_referencia: '',
  referencia_id: '',
  data_envio: '',
  data_limite_resposta: '',
  status: 'rascunho',
  observacoes: '',
  proposals: [{ ...emptyProposal }],
}

const emptyOptions = {
  transporters: [],
  transport_orders: [],
  loads: [],
}

const FreightQuotationFormPage = () => {
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
        const [loadedOptions, quotation] = await Promise.all([
          freightQuotationService.options(),
          isEdit ? freightQuotationService.findById(id) : Promise.resolve(null),
        ])

        setOptions({
          transporters: loadedOptions.transporters || [],
          transport_orders: loadedOptions.transport_orders || [],
          loads: loadedOptions.loads || [],
        })

        if (quotation) {
          setValues({
            ...initialValues,
            ...quotation,
            referencia_id: quotation.referencia_id ? String(quotation.referencia_id) : '',
            proposals:
              quotation.proposals?.map((proposal) => ({
                transporter_id: proposal.transporter_id ? String(proposal.transporter_id) : '',
                valor_frete: proposal.valor_frete ?? '',
                prazo_entrega_dias: proposal.prazo_entrega_dias ?? '',
                observacoes: proposal.observacoes || '',
                status_resposta: proposal.status_resposta || 'pendente',
              })) || [{ ...emptyProposal }],
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
      [name]: name === 'tipo_referencia' ? value : value,
      ...(name === 'tipo_referencia' ? { referencia_id: '' } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleProposalChange = (index, field, value) => {
    setValues((current) => ({
      ...current,
      proposals: current.proposals.map((proposal, proposalIndex) =>
        proposalIndex === index ? { ...proposal, [field]: value } : proposal,
      ),
    }))
    setErrors((current) => ({ ...current, [`proposals.${index}.${field}`]: undefined, proposals: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateFreightQuotationForm(values)
    setErrors(validationErrors)
    setFeedback('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isEdit) {
        await freightQuotationService.update(id, values)
        setFeedback('Cotacao atualizada com sucesso.')
      } else {
        await freightQuotationService.create(values)
        navigate('/operations/freight-quotations', {
          replace: true,
          state: { feedback: 'Cotacao criada com sucesso.' },
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
        title={isEdit ? 'Editar cotacao de frete' : 'Nova cotacao de frete'}
        description="Monte a concorrencia, distribua para transportadoras e registre as propostas recebidas."
        createPath="/operations/freight-quotations"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3 d-flex gap-2">
        <CButton color="secondary" variant="outline" as={Link} to="/operations/freight-quotations">
          Voltar
        </CButton>
        {isEdit ? (
          <CButton color="info" variant="outline" as={Link} to={`/operations/freight-quotations/${id}`}>
            Ver acompanhamento
          </CButton>
        ) : null}
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      {isLoading ? (
        <CAlert color="info">Carregando estrutura da cotacao...</CAlert>
      ) : (
        <FreightQuotationForm
          values={values}
          errors={errors}
          options={options}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onProposalChange={handleProposalChange}
          onAddProposal={() =>
            setValues((current) => ({ ...current, proposals: [...current.proposals, { ...emptyProposal }] }))
          }
          onRemoveProposal={(index) =>
            setValues((current) => ({
              ...current,
              proposals: current.proposals.filter((_, proposalIndex) => proposalIndex !== index),
            }))
          }
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar cotacao'}
        />
      )}
    </>
  )
}

export default FreightQuotationFormPage
