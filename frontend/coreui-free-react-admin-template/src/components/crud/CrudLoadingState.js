import React from 'react'
import { CCard, CCardBody, CSpinner } from '@coreui/react'

const CrudLoadingState = ({ message = 'Carregando dados...' }) => (
  <CCard className="mb-4 shadow-sm border-0">
    <CCardBody className="py-5 d-flex flex-column align-items-center justify-content-center text-center gap-3">
      <CSpinner color="primary" />
      <div className="text-body-secondary">{message}</div>
    </CCardBody>
  </CCard>
)

export default CrudLoadingState
