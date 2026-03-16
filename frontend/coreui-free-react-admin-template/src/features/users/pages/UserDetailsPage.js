import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react'
import useAuthorization from '../../../hooks/useAuthorization'
import CrudStatusBadge from '../../../components/crud/CrudStatusBadge'
import userService from '../services/userService'

const UserDetailsPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { hasPermission } = useAuthorization()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await userService.findById(id)
        setUser(data)
      } catch (error) {
        dispatch({ type: 'app/setError', payload: error.message })
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [dispatch, id])

  if (isLoading) {
    return <CAlert color="info">Carregando detalhes do usuario...</CAlert>
  }

  if (!user) {
    return <CAlert color="warning">Usuario nao encontrado.</CAlert>
  }

  return (
    <>
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <CButton color="secondary" variant="outline" as={Link} to="/admin/users">
          Voltar
        </CButton>
        {hasPermission('users.manage') ? (
          <CButton color="info" variant="outline" as={Link} to={`/admin/users/${user.id}/edit`}>
            Editar usuario
          </CButton>
        ) : null}
      </div>
      <CRow className="g-4">
        <CCol lg={7}>
          <CCard className="shadow-sm border-0">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <span>{user.name}</span>
              <CrudStatusBadge status={user.status} />
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol md={6}>
                  <strong>E-mail</strong>
                  <div>{user.email}</div>
                </CCol>
                <CCol md={6}>
                  <strong>Telefone</strong>
                  <div>{user.telefone || '-'}</div>
                </CCol>
                <CCol md={6}>
                  <strong>Empresa principal</strong>
                  <div>{user.companies?.find((company) => company.is_default)?.name || '-'}</div>
                </CCol>
                <CCol md={6}>
                  <strong>Perfil principal</strong>
                  <div>{user.roles?.[0]?.name || '-'}</div>
                </CCol>
                <CCol md={6}>
                  <strong>Ultimo acesso</strong>
                  <div>{user.last_login_at ? new Date(user.last_login_at).toLocaleString('pt-BR') : 'Nunca acessou'}</div>
                </CCol>
                <CCol md={6}>
                  <strong>Criado em</strong>
                  <div>{user.created_at ? new Date(user.created_at).toLocaleString('pt-BR') : '-'}</div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={5}>
          <CCard className="shadow-sm border-0 mb-4">
            <CCardHeader>Empresas vinculadas</CCardHeader>
            <CCardBody className="d-flex gap-2 flex-wrap">
              {user.companies?.length
                ? user.companies.map((company) => (
                    <CBadge key={company.id} color={company.is_default ? 'primary' : 'secondary'}>
                      {company.name}
                    </CBadge>
                  ))
                : 'Nenhuma empresa vinculada.'}
            </CCardBody>
          </CCard>
          <CCard className="shadow-sm border-0">
            <CCardHeader>Perfis vinculados</CCardHeader>
            <CCardBody className="d-flex gap-2 flex-wrap">
              {user.roles?.length
                ? user.roles.map((role) => (
                    <CBadge key={`${role.id}-${role.company_id || 'global'}`} color="dark">
                      {role.name}
                    </CBadge>
                  ))
                : 'Nenhum perfil vinculado.'}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default UserDetailsPage
