import React from 'react'
import { Link } from 'react-router-dom'
import { CButton, CCol, CContainer, CRow } from '@coreui/react'

const Page403 = () => {
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} className="text-center">
            <div className="clearfix">
              <h1 className="float-start display-3 me-4">403</h1>
              <h4 className="pt-3">Acesso negado</h4>
              <p className="text-body-secondary float-start">
                Seu perfil nao possui permissao para acessar esta area do TMS.
              </p>
            </div>
            <CButton color="primary" as={Link} to="/dashboard">
              Voltar ao dashboard
            </CButton>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Page403
