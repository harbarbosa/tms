import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CAlert, CButton } from '@coreui/react'
import CrudPageHeader from '../../../components/crud/CrudPageHeader'
import RoleForm from '../components/RoleForm'
import roleService from '../services/roleService'
import { validateRoleForm } from '../utils/roleValidation'

const initialValues = {
  name: '',
  description: '',
  scope: 'global',
  status: 'active',
}

const RoleFormPage = () => {
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

    const loadRole = async () => {
      try {
        const data = await roleService.findById(id)
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

    loadRole()
  }, [dispatch, id, isEdit])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateRoleForm(values)
    setErrors(validationErrors)
    setFeedback('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isEdit) {
        await roleService.update(id, values)
        setFeedback('Perfil atualizado com sucesso.')
      } else {
        await roleService.create(values)
        navigate('/admin/roles', {
          replace: true,
          state: { feedback: 'Perfil criado com sucesso.' },
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
        title={isEdit ? 'Editar perfil' : 'Novo perfil'}
        description="Cadastre ou ajuste um papel de acesso mantendo a compatibilidade com o RBAC ja implementado."
        createPath="/admin/roles"
        createLabel="Voltar para listagem"
      />
      <div className="mb-3">
        <CButton color="secondary" variant="outline" as={Link} to="/admin/roles">
          Voltar
        </CButton>
      </div>
      {feedback ? (
        <CAlert color="success" dismissible onClose={() => setFeedback('')}>
          {feedback}
        </CAlert>
      ) : null}
      {isLoading ? (
        <CAlert color="info">Carregando dados do perfil...</CAlert>
      ) : (
        <RoleForm
          values={values}
          errors={errors}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={isEdit ? 'Salvar alteracoes' : 'Criar perfil'}
        />
      )}
    </>
  )
}

export default RoleFormPage
