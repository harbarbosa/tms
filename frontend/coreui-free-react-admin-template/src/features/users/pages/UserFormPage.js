import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import UserForm from '../components/UserForm'
import userService from '../services/userService'
import { validateUserForm } from '../utils/userValidation'

const initialValues = {
  name: '',
  email: '',
  telefone: '',
  password: '',
  status: 'active',
  primary_company_id: '',
  company_ids: [],
  primary_role_id: '',
  role_ids: [],
}

const UserFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isEdit = Boolean(id)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [options, setOptions] = useState({ companies: [], roles: [] })
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const loadedOptions = await userService.options()
        setOptions(loadedOptions || { companies: [], roles: [] })

        if (isEdit) {
          const data = await userService.findById(id)
          setValues({
            ...initialValues,
            ...data,
            password: '',
            primary_company_id: data.primary_company_id ? String(data.primary_company_id) : '',
            company_ids: (data.company_ids || []).map(String),
            primary_role_id: data.primary_role_id ? String(data.primary_role_id) : '',
            role_ids: (data.role_ids || []).map(String),
          })
          return
        }

        setValues((current) => ({
          ...current,
          primary_company_id: loadedOptions?.companies?.[0] ? String(loadedOptions.companies[0].id) : '',
          company_ids: loadedOptions?.companies?.[0] ? [String(loadedOptions.companies[0].id)] : [],
          primary_role_id: loadedOptions?.roles?.[0] ? String(loadedOptions.roles[0].id) : '',
          role_ids: loadedOptions?.roles?.[0] ? [String(loadedOptions.roles[0].id)] : [],
        }))
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

  const toggleSelection = (field, value, primaryField) => {
    setValues((current) => {
      const exists = current[field].includes(value)
      const nextValues = exists ? current[field].filter((item) => item !== value) : [...current[field], value]
      const nextState = {
        ...current,
        [field]: nextValues,
      }

      if (!exists && !current[primaryField]) {
        nextState[primaryField] = value
      }

      if (exists && current[primaryField] === value) {
        nextState[primaryField] = nextValues[0] || ''
      }

      return nextState
    })

    setErrors((current) => ({ ...current, [field]: undefined, [primaryField]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateUserForm(values, isEdit)
    setErrors(validationErrors)
    setFeedback('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        ...values,
        primary_company_id: Number(values.primary_company_id),
        company_ids: values.company_ids.map(Number),
        primary_role_id: Number(values.primary_role_id),
        role_ids: values.role_ids.map(Number),
      }

      if (isEdit) {
        await userService.update(id, payload)
        setFeedback('Usuario atualizado com sucesso.')
      } else {
        await userService.create(payload)
        navigate('/admin/users', {
          replace: true,
          state: { feedback: 'Usuario criado com sucesso.' },
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
        title={isEdit ? 'Editar usuario' : 'Novo usuario'}
        description="Configure credenciais, empresas vinculadas e perfis de acesso sem sair do padrao administrativo do TMS."
        createPath="/admin/users"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3">
        <CButton color="secondary" variant="outline" as={Link} to="/admin/users">
          Voltar
        </CButton>
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      {isLoading ? (
        <CAlert color="info">Carregando dados do usuario...</CAlert>
      ) : (
        <UserForm
          values={values}
          errors={errors}
          options={options}
          isSubmitting={isSubmitting}
          isEdit={isEdit}
          onChange={handleChange}
          onToggleCompany={(value) => toggleSelection('company_ids', value, 'primary_company_id')}
          onToggleRole={(value) => toggleSelection('role_ids', value, 'primary_role_id')}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar usuario'}
        />
      )}
    </>
  )
}

export default UserFormPage
