import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import tripDocumentService from '../services/tripDocumentService'
import TripDocumentUploadForm from '../components/TripDocumentUploadForm'
import { validateTripDocumentForm } from '../utils/tripDocumentValidation'

const TripDocumentUploadPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const preselectedTransportDocumentId = new URLSearchParams(location.search).get('ordem_transporte_id') || ''
  const [values, setValues] = useState({
    ordem_transporte_id: preselectedTransportDocumentId,
    tipo_documento: '',
    numero_documento: '',
    observacoes: '',
    arquivo: null,
  })
  const [errors, setErrors] = useState({})
  const [options, setOptions] = useState({ transport_documents: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const data = await tripDocumentService.options()
        setOptions({ transport_documents: data.transport_documents || [] })
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    loadOptions()
  }, [dispatch])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateTripDocumentForm(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const formData = new FormData()
    formData.append('ordem_transporte_id', values.ordem_transporte_id)
    formData.append('tipo_documento', values.tipo_documento)
    formData.append('numero_documento', values.numero_documento)
    formData.append('observacoes', values.observacoes)
    formData.append('arquivo', values.arquivo)

    setIsSubmitting(true)

    try {
      await tripDocumentService.upload(formData)
      navigate('/execution/trip-documents', {
        replace: true,
        state: { feedback: 'Documento enviado com sucesso.' },
      })
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
        title="Novo documento da viagem"
        description="Envie arquivos logísticos com controle por OT e tipologia documental."
        createPath="/execution/trip-documents"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3">
        <CButton color="secondary" variant="outline" as={Link} to="/execution/trip-documents">
          Voltar
        </CButton>
      </div>
      {isLoading ? (
        <CAlert color="info">Carregando estrutura do upload...</CAlert>
      ) : (
        <TripDocumentUploadForm
          values={values}
          errors={errors}
          options={options}
          isSubmitting={isSubmitting}
          onChange={(event) => {
            const { name, value } = event.target
            setValues((current) => ({ ...current, [name]: value }))
            setErrors((current) => ({ ...current, [name]: undefined }))
          }}
          onFileChange={(event) => {
            const file = event.target.files?.[0] || null
            setValues((current) => ({ ...current, arquivo: file }))
            setErrors((current) => ({ ...current, arquivo: undefined }))
          }}
          onSubmit={handleSubmit}
        />
      )}
    </>
  )
}

export default TripDocumentUploadPage
