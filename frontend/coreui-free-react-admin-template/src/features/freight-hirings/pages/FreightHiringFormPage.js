import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import freightHiringService from '../services/freightHiringService'
import FreightHiringForm from '../components/FreightHiringForm'
import { validateFreightHiringForm } from '../utils/freightHiringValidation'

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
  freight_quotation_id: '',
  freight_quotation_proposal_id: '',
  tipo_referencia: 'pedido',
  referencia_id: '',
  reference_label: '',
  transporter_id: '',
  valor_contratado: '',
  prazo_entrega_dias: '',
  condicoes_comerciais: '',
  observacoes: '',
  status: 'pendente',
  contratado_por: '',
  data_contratacao: '',
}

const FreightHiringFormPage = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isEdit = Boolean(id)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [options, setOptions] = useState({ quotations: [], transporters: [], statusOptions: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

  const selectedQuotation = useMemo(
    () => (options.quotations || []).find((item) => String(item.id) === String(values.freight_quotation_id)),
    [options.quotations, values.freight_quotation_id],
  )

  const approvedProposals = selectedQuotation?.approved_proposals || []
  const selectedProposal = approvedProposals.find(
    (item) => String(item.id) === String(values.freight_quotation_proposal_id),
  )

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [loadedOptions, hiring] = await Promise.all([
          freightHiringService.options(),
          isEdit ? freightHiringService.findById(id) : Promise.resolve(null),
        ])

        const normalizedOptions = {
          quotations: loadedOptions.quotations || [],
          transporters: loadedOptions.transporters || [],
          statusOptions: loadedOptions.statusOptions || [],
        }

        setOptions(normalizedOptions)

        if (hiring) {
          setValues({
            freight_quotation_id: hiring.freight_quotation_id ? String(hiring.freight_quotation_id) : '',
            freight_quotation_proposal_id: hiring.freight_quotation_proposal_id
              ? String(hiring.freight_quotation_proposal_id)
              : '',
            tipo_referencia: hiring.tipo_referencia || 'pedido',
            referencia_id: hiring.referencia_id ? String(hiring.referencia_id) : '',
            reference_label: hiring.reference_summary?.label || '',
            transporter_id: hiring.transporter_id ? String(hiring.transporter_id) : '',
            valor_contratado: hiring.valor_contratado ?? '',
            prazo_entrega_dias: hiring.prazo_entrega_dias ?? '',
            condicoes_comerciais: hiring.condicoes_comerciais || '',
            observacoes: hiring.observacoes || '',
            status: hiring.status || 'pendente',
            contratado_por: hiring.contratado_por || '',
            data_contratacao: toLocalDateTime(hiring.data_contratacao),
          })
        } else {
          const quotationId = searchParams.get('quotation_id') || ''
          const proposalId = searchParams.get('proposal_id') || ''
          const quotation = normalizedOptions.quotations.find((item) => String(item.id) === String(quotationId))
          const proposal = quotation?.approved_proposals?.find((item) => String(item.id) === String(proposalId))

          setValues((current) => ({
            ...current,
            freight_quotation_id: quotationId,
            freight_quotation_proposal_id: proposalId,
            tipo_referencia: quotation?.tipo_referencia || current.tipo_referencia,
            referencia_id: quotation?.referencia_id ? String(quotation.referencia_id) : current.referencia_id,
            reference_label: quotation?.reference_summary?.label || current.reference_label,
            transporter_id: proposal?.transporter_id ? String(proposal.transporter_id) : current.transporter_id,
            valor_contratado: proposal?.valor_frete ?? current.valor_contratado,
            prazo_entrega_dias: proposal?.prazo_entrega_dias ?? current.prazo_entrega_dias,
            condicoes_comerciais: proposal?.observacoes || current.condicoes_comerciais,
            data_contratacao: current.data_contratacao || toLocalDateTime(new Date().toISOString()),
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

      if (name === 'freight_quotation_id') {
        const quotation = (options.quotations || []).find((item) => String(item.id) === String(value))
        nextValues.freight_quotation_proposal_id = ''
        nextValues.tipo_referencia = quotation?.tipo_referencia || current.tipo_referencia
        nextValues.referencia_id = quotation?.referencia_id ? String(quotation.referencia_id) : ''
        nextValues.reference_label = quotation?.reference_summary?.label || ''
        nextValues.transporter_id = ''
        nextValues.valor_contratado = ''
        nextValues.prazo_entrega_dias = ''
        nextValues.condicoes_comerciais = ''
      }

      if (name === 'freight_quotation_proposal_id') {
        const proposal = approvedProposals.find((item) => String(item.id) === String(value))
        nextValues.transporter_id = proposal?.transporter_id ? String(proposal.transporter_id) : ''
        nextValues.valor_contratado = proposal?.valor_frete ?? ''
        nextValues.prazo_entrega_dias = proposal?.prazo_entrega_dias ?? ''
        nextValues.condicoes_comerciais = proposal?.observacoes || current.condicoes_comerciais
      }

      return nextValues
    })

    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateFreightHiringForm(values)
    setErrors(validationErrors)
    setFeedback('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const payload = {
      ...values,
      data_contratacao: toApiDateTime(values.data_contratacao),
    }

    setIsSubmitting(true)

    try {
      if (isEdit) {
        await freightHiringService.update(id, payload)
        setFeedback('Contratacao atualizada com sucesso.')
      } else {
        await freightHiringService.create(payload)
        navigate('/operations/freight-hirings', {
          replace: true,
          state: { feedback: 'Contratacao criada com sucesso.' },
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
        title={isEdit ? 'Editar contratacao de frete' : 'Nova contratacao de frete'}
        description="Formalize a proposta aprovada, preserve o historico comercial e prepare a geracao da ordem de transporte."
        createPath="/operations/freight-hirings"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3 d-flex gap-2">
        <CButton color="secondary" variant="outline" as={Link} to="/operations/freight-hirings">
          Voltar
        </CButton>
        {isEdit ? (
          <CButton color="info" variant="outline" as={Link} to={`/operations/freight-hirings/${id}`}>
            Ver detalhes
          </CButton>
        ) : null}
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      {selectedQuotation && selectedProposal ? (
        <CAlert color="info">
          Contratacao vinculada a {selectedQuotation.reference_summary?.label} com proposta aprovada de{' '}
          {selectedProposal.transporter_name}.
        </CAlert>
      ) : null}
      {isLoading ? (
        <CAlert color="info">Carregando estrutura da contratacao...</CAlert>
      ) : (
        <FreightHiringForm
          values={values}
          errors={errors}
          options={options}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar contratacao'}
        />
      )}
    </>
  )
}

export default FreightHiringFormPage
