import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import FinancialForm from '../components/FinancialForm'
import financialService from '../services/financialService'
import { validateFinancialForm } from '../utils/financialValidation'

const initialValues = {
  freight_audit_id: '',
  transport_document_id: '',
  transporter_id: '',
  numero_ot: '',
  valor_previsto: '',
  valor_aprovado: '',
  valor_pago: '',
  data_prevista_pagamento: '',
  data_pagamento: '',
  forma_pagamento: '',
  status: 'pendente',
  motivo_bloqueio: '',
  observacoes: '',
}

const FinancialFormPage = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isEdit = Boolean(id)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [options, setOptions] = useState({
    audits: [],
    transporters: [],
    statusOptions: [],
    paymentMethods: [],
    blockReasonOptions: [],
  })
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [loadedOptions, entry] = await Promise.all([
          financialService.options(),
          isEdit ? financialService.findById(id) : Promise.resolve(null),
        ])

        const normalizedOptions = {
          audits: loadedOptions.audits || [],
          transporters: loadedOptions.transporters || [],
          statusOptions: loadedOptions.statusOptions || [],
          paymentMethods: loadedOptions.paymentMethods || [],
          blockReasonOptions: loadedOptions.blockReasonOptions || [],
        }

        setOptions(normalizedOptions)

        if (entry) {
          setValues({
            ...initialValues,
            ...entry,
            freight_audit_id: entry.freight_audit_id ? String(entry.freight_audit_id) : '',
            transport_document_id: entry.transport_document_id ? String(entry.transport_document_id) : '',
            transporter_id: entry.transporter_id ? String(entry.transporter_id) : '',
            numero_ot: entry.numero_ot || '',
            valor_previsto: entry.valor_previsto ?? '',
            valor_aprovado: entry.valor_aprovado ?? '',
            valor_pago: entry.valor_pago ?? '',
          })
        } else {
          const auditId = searchParams.get('audit_id') || ''
          const selectedAudit = normalizedOptions.audits.find((item) => String(item.id) === String(auditId))

          setValues((current) => ({
            ...current,
            freight_audit_id: auditId,
            transport_document_id: selectedAudit?.ordem_transporte_id ? String(selectedAudit.ordem_transporte_id) : '',
            transporter_id: selectedAudit?.transporter_id ? String(selectedAudit.transporter_id) : '',
            numero_ot: selectedAudit?.numero_ot || '',
            valor_previsto: selectedAudit?.valor_cobrado ?? '',
            status:
              selectedAudit && (Number(selectedAudit.diferenca_valor || 0) !== 0 || selectedAudit.status_auditoria === 'divergente')
                ? 'bloqueado'
                : current.status,
            motivo_bloqueio:
              selectedAudit && (Number(selectedAudit.diferenca_valor || 0) !== 0 || selectedAudit.status_auditoria === 'divergente')
                ? 'Bloqueado automaticamente por divergencia na auditoria.'
                : current.motivo_bloqueio,
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

      if (name === 'freight_audit_id') {
        const audit = (options.audits || []).find((item) => String(item.id) === String(value))
        const hasDivergence =
          Number(audit?.diferenca_valor || 0) !== 0 || audit?.status_auditoria === 'divergente'
        nextValues.transport_document_id = audit?.ordem_transporte_id ? String(audit.ordem_transporte_id) : ''
        nextValues.transporter_id = audit?.transporter_id ? String(audit.transporter_id) : ''
        nextValues.numero_ot = audit?.numero_ot || ''
        nextValues.valor_previsto = audit?.valor_cobrado ?? ''
        nextValues.status = hasDivergence ? 'bloqueado' : 'pendente'
        nextValues.motivo_bloqueio = hasDivergence
          ? 'Bloqueado automaticamente por divergencia na auditoria.'
          : ''
      }

      return nextValues
    })

    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateFinancialForm(values)
    setErrors(validationErrors)
    setFeedback('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isEdit) {
        await financialService.update(id, values)
        setFeedback('Lancamento financeiro atualizado com sucesso.')
      } else {
        await financialService.create(values)
        navigate('/financial', {
          replace: true,
          state: { feedback: 'Lancamento financeiro criado com sucesso.' },
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
        title={isEdit ? 'Editar lancamento financeiro' : 'Novo lancamento financeiro'}
        description="Crie o controle financeiro a partir da auditoria e mantenha a rastreabilidade da aprovacao do frete."
        createPath="/financial"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3 d-flex gap-2">
        <CButton color="secondary" variant="outline" as={Link} to="/financial">
          Voltar
        </CButton>
        {isEdit ? (
          <CButton color="info" variant="outline" as={Link} to={`/financial/${id}`}>
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
        <CAlert color="info">Carregando estrutura financeira...</CAlert>
      ) : (
        <FinancialForm
          values={values}
          errors={errors}
          options={options}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar lancamento'}
        />
      )}
    </>
  )
}

export default FinancialFormPage
