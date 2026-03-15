import React from 'react'
import { CBadge, CButton, CCard, CCardBody, CCardHeader } from '@coreui/react'

const ModulePlaceholderPage = ({ title, description }) => {
  return (
    <CCard className="mb-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <span>{title}</span>
        <CBadge color="info">Estrutura pronta</CBadge>
      </CCardHeader>
      <CCardBody>
        <p className="mb-3 text-body-secondary">{description}</p>
        <p className="mb-4">
          Esta tela ja esta plugada no layout autenticado, na navegacao do CoreUI e na estrutura
          modular do projeto.
        </p>
        <CButton color="primary" variant="outline" disabled>
          Modulo em construcao
        </CButton>
      </CCardBody>
    </CCard>
  )
}

export default ModulePlaceholderPage
