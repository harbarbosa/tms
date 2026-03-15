import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import proofOfDeliveryService from '../services/proofOfDeliveryService'
import ProofOfDeliveryForm from '../components/ProofOfDeliveryForm'
import { validateProofOfDeliveryForm } from '../utils/proofOfDeliveryValidation'

const toLocalDateTime = (value) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const pad = (input) => String(input).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const toApiDateTime = (value) => (value ? `${value.replace('T', ' ')}:00` : '')

const ProofOfDeliveryFormPage = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isEdit = Boolean(id)
  const preselectedTransportDocumentId = new URLSearchParams(location.search).get('ordem_transporte_id') || ''
  const [values, setValues] = useState({
    ordem_transporte_id: preselectedTransportDocumentId,
    data_entrega_real: '',
    nome_recebedor: '',
    documento_recebedor: '',
    observacoes_entrega: '',
    arquivo_comprovante: null,
    nome_arquivo_original: '',
  })
  const [errors, setErrors] = useState({})
  const [options, setOptions] = useState({ transport_documents: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [loadedOptions, receipt] = await Promise.all([
          proofOfDeliveryService.options(),
          isEdit ? proofOfDeliveryService.findById(id) : Promise.resolve(null),
        ])

        setOptions({ transport_documents: loadedOptions.transport_documents || [] })

        if (receipt) {
          setValues({
            ordem_transporte_id: receipt.ordem_transporte_id ? String(receipt.ordem_transporte_id) : '',
            data_entrega_real: toLocalDateTime(receipt.data_entrega_real),
            nome_recebedor: receipt.nome_recebedor || '',
            documento_recebedor: receipt.documento_recebedor || '',
            observacoes_entrega: receipt.observacoes_entrega || '',
            arquivo_comprovante: null,
            nome_arquivo_original: receipt.nome_arquivo_original || '',
          })
        } else {
          setValues((current) => ({
            ...current,
            data_entrega_real: current.data_entrega_real || toLocalDateTime(new Date().toISOString()),
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
    const validationErrors = validateProofOfDeliveryForm(values, isEdit)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const formData = new FormData()
    formData.append('ordem_transporte_id', values.ordem_transporte_id)
    formData.append('data_entrega_real', toApiDateTime(values.data_entrega_real))
    formData.append('nome_recebedor', values.nome_recebedor)
    formData.append('documento_recebedor', values.documento_recebedor)
    formData.append('observacoes_entrega', values.observacoes_entrega)

    if (values.arquivo_comprovante) {
      formData.append('arquivo_comprovante', values.arquivo_comprovante)
    }

    setIsSubmitting(true)

    try {
      if (isEdit) {
        await proofOfDeliveryService.update(id, formData)
        navigate('/execution/proof-of-deliveries', {
          replace: true,
          state: { feedback: 'Comprovante atualizado com sucesso.' },
        })
      } else {
        await proofOfDeliveryService.create(formData)
        navigate('/execution/proof-of-deliveries', {
          replace: true,
          state: { feedback: 'Comprovante criado com sucesso.' },
        })
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
        title={isEdit ? 'Editar comprovante de entrega' : 'Novo comprovante de entrega'}
        description="Registre a entrega real, o recebedor e o arquivo digital do comprovante."
        createPath="/execution/proof-of-deliveries"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3 d-flex gap-2">
        <CButton color="secondary" variant="outline" as={Link} to="/execution/proof-of-deliveries">
          Voltar
        </CButton>
        {isEdit ? (
          <CButton color="info" variant="outline" onClick={() => proofOfDeliveryService.openFile(id)}>
            Visualizar arquivo
          </CButton>
        ) : null}
      </div>
      {isLoading ? (
        <CAlert color="info">Carregando estrutura do comprovante...</CAlert>
      ) : (
        <ProofOfDeliveryForm
          values={values}
          errors={errors}
          options={options}
          isSubmitting={isSubmitting}
          isEdit={isEdit}
          onChange={(event) => {
            const { name, value } = event.target
            setValues((current) => ({ ...current, [name]: value }))
            setErrors((current) => ({ ...current, [name]: undefined }))
          }}
          onFileChange={(event) => {
            const file = event.target.files?.[0] || null
            setValues((current) => ({ ...current, arquivo_comprovante: file }))
            setErrors((current) => ({ ...current, arquivo_comprovante: undefined }))
          }}
          onSubmit={handleSubmit}
        />
      )}
    </>
  )
}

export default ProofOfDeliveryFormPage
