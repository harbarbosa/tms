import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilTruck, cilUser } from '@coreui/icons'
import useAuth from '../../../hooks/useAuth'
import { resolvePostLoginPath } from '../../../utils/homePaths'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [credentials, setCredentials] = useState({
    email: 'admin@tms.local',
    password: '123456',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setCredentials((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')
    setIsSubmitting(true)

    try {
      const session = await login(credentials)
      const redirectTo = resolvePostLoginPath(session?.user, location.state?.from?.pathname)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setLocalError(error.message || 'Nao foi possivel autenticar seu acesso.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={10} lg={9} xl={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Acessar TMS</h1>
                    <p className="text-body-secondary">
                      Entre com sua conta para gerenciar operacoes, fretes e parceiros.
                    </p>
                    {localError ? <CAlert color="danger">{localError}</CAlert> : null}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        name="email"
                        type="email"
                        placeholder="E-mail"
                        autoComplete="username"
                        value={credentials.email}
                        onChange={handleChange}
                        required
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        name="password"
                        type="password"
                        placeholder="Senha"
                        autoComplete="current-password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Entrando...' : 'Entrar'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-end">
                        <CButton color="link" className="px-0" type="button">
                          Esqueci minha senha
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center d-flex flex-column justify-content-center">
                  <div>
                    <CIcon icon={cilTruck} size="3xl" className="mb-4" />
                    <h2>TMS SaaS</h2>
                    <p>
                      Base inicial pronta para crescer com modulos operacionais, financeiros e
                      administrativos.
                    </p>
                    <p className="small mb-4">
                      Ambiente demo: use <strong>admin@tms.local</strong> e <strong>123456</strong>
                    </p>
                    <Link to="/register">
                      <CButton color="light" variant="outline" className="mt-1" active tabIndex={-1}>
                        Solicitar acesso
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default LoginPage
