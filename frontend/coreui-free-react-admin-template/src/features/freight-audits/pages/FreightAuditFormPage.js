import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import freightAuditService from '../services/freightAuditService'
import FreightAuditForm from '../components/FreightAuditForm'
import { validateFreightAuditForm } from '../utils/freightAuditValidation'

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
  ordem_transporte_id: '',
  valor_contratado: '',
  valor_cte: '',
  valor_cobrado: '',
  diferenca_valor: 0,
  status_auditoria: 'pendente',
  observacoes: '',
  data_auditoria: '',
}

const FreightAuditFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isEdit = Boolean(id)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [options, setOptions] = useState({ transport_documents: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [loadedOptions, audit] = await Promise.all([
          freightAuditService.options(),
          isEdit ? freightAuditService.findById(id) : Promise.resolve(null),
        ])

        setOptions({ transport_documents: loadedOptions.transport_documents || [] })

        if (audit) {
          setValues({
            ordem_transporte_id: audit.ordem_transporte_id ? String(audit.ordem_transporte_id) : '',
            valor_contratado: audit.valor_contratado ?? '',
            valor_cte: audit.valor_cte ?? '',
            valor_cobrado: audit.valor_cobrado ?? '',
            diferenca_valor: audit.diferenca_valor ?? 0,
            status_auditoria: audit.status_auditoria || 'pendente',
            observacoes: audit.observacoes || '',
            data_auditoria: toLocalDateTime(audit.data_auditoria),
          })
        } else {
          setValues((current) => ({
            ...current,
            data_auditoria: current.data_auditoria || toLocalDateTime(new Date().toISOString()),
          }))
        }
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    bootstrap()
  }, [dispatch, id, isEdit])

  const selectedTransportDocument = useMemo(
    () => (options.transport_documents || []).find((item) => String(item.id) === String(values.ordem_transporte_id)),
    [options.transport_documents, values.ordem_transporte_id],
  )

  const updateValues = (nextValues) => {
    const valorContratado = Number(nextValues.valor_contratado || 0)
    const valorCobrado = Number(nextValues.valor_cobrado || 0)

    setValues({
      ...nextValues,
      diferenca_valor: Number((valorCobrado - valorContratado).toFixed(2)),
    })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    const nextValues = { ...values, [name]: value }

    if (name === 'ordem_transporte_id' && value) {
      const target = (options.transport_documents || []).find((item) => String(item.id) === String(value))
      if (target?.valor_frete_contratado) {
        nextValues.valor_contratado = target.valor_frete_contratado
      }
    }

    updateValues(nextValues)
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateFreightAuditForm(values)
    setErrors(validationErrors)
    setFeedback('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const payload = {
      ...values,
      data_auditoria: toApiDateTime(values.data_auditoria),
    }

    setIsSubmitting(true)

    try {
      if (isEdit) {
        await freightAuditService.update(id, payload)
        setFeedback('Auditoria atualizada com sucesso.')
      } else {
        await freightAuditService.create(payload)
        navigate('/control/freight-audits', {
          replace: true,
          state: { feedback: 'Auditoria criada com sucesso.' },
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
        title={isEdit ? 'Editar auditoria de frete' : 'Nova auditoria de frete'}
        description="Consolide a conferencia financeira da OT e deixe a base preparada para o modulo financeiro."
        createPath="/control/freight-audits"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3 d-flex gap-2">
        <CButton color="secondary" variant="outline" as={Link} to="/control/freight-audits">
          Voltar
        </CButton>
        {isEdit ? (
          <CButton color="info" variant="outline" as={Link} to={`/control/freight-audits/${id}`}>
            Ver detalhes
          </CButton>
        ) : null}
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      {selectedTransportDocument && Number(values.diferenca_valor || 0) !== 0 ? (
        <CAlert color="danger">
          Divergencia detectada para a OT {selectedTransportDocument.numero_ot}: diferenca atual de{' '}
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(values.diferenca_valor || 0))}.
        </CAlert>
      ) : null}
      {isLoading ? (
        <CAlert color="info">Carregando estrutura da auditoria...</CAlert>
      ) : (
        <FreightAuditForm
          values={values}
          errors={errors}
          options={options}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar auditoria'}
        />
      )}
    </>
  )
}

export default FreightAuditFormPage
