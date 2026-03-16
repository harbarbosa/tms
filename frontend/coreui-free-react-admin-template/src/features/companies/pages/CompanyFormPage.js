import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import CompanyForm from '../components/CompanyForm'
import companyService from '../services/companyService'
import { validateCompanyForm } from '../utils/companyValidation'

const initialValues = {
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
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
  tipo_empresa: 'embarcador',
  limite_usuarios: 10,
  limite_transportadoras: 10,
  limite_veiculos: 50,
  limite_motoristas: 50,
}

const CompanyFormPage = () => {
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

    const loadCompany = async () => {
      try {
        const data = await companyService.findById(id)
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

    loadCompany()
  }, [dispatch, id, isEdit])

  const handleChange = (event) => {
    const { name, value } = event.target
    const normalizedValue = name === 'estado' ? value.toUpperCase() : value
    setValues((current) => ({ ...current, [name]: normalizedValue }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateCompanyForm(values)
    setErrors(validationErrors)
    setFeedback('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isEdit) {
        await companyService.update(id, values)
        setFeedback('Empresa atualizada com sucesso.')
      } else {
        await companyService.create(values)
        navigate('/admin/companies', {
          replace: true,
          state: { feedback: 'Empresa criada com sucesso.' },
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
        title={isEdit ? 'Editar empresa' : 'Nova empresa'}
        description="Mantenha os dados cadastrais, limites operacionais e o enquadramento da empresa na plataforma."
        createPath="/admin/companies"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3">
        <CButton color="secondary" variant="outline" as={Link} to="/admin/companies">
          Voltar
        </CButton>
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      {isLoading ? (
        <CAlert color="info">Carregando dados da empresa...</CAlert>
      ) : (
        <CompanyForm
          values={values}
          errors={errors}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar empresa'}
        />
      )}
    </>
  )
}

export default CompanyFormPage
